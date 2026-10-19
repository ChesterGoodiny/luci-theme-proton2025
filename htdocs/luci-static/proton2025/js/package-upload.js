/**
 * Proton2025 - Package upload (System -> Software)
 * Copyright 2025-2026 ChesterGoodiny
 * Licensed under the Apache License, Version 2.0
 * See LICENSE and NOTICE for details.
 *
 * Fixes and extends "Upload Package..." on System -> Software:
 *  - on OpenWrt 25.12+ (apk) the stock installer runs `apk add <file>` without
 *    --allow-untrusted, so any package that is not signed by a trusted key fails
 *    with "UNTRUSTED signature" (openwrt/luci#8482). The install step is handed
 *    to luci.proton-packages, which installs with --allow-untrusted;
 *  - several files can be selected at once and are installed together in one
 *    transaction, so packages that depend on each other work in any order.
 *
 * The stock dialogs, progress and command output stay as they are: only
 * ui.uploadFile (for the package upload path) and the install call are replaced.
 * Anything this script does not recognise falls through to the original code.
 */

(function () {
  "use strict";

  const PAGE = "admin-system-package-manager";
  const PM_CALL = "/usr/libexec/package-manager-call";
  const MAX_FILES = 32;

  const t = function (key) {
    return typeof window.protonT === "function" ? window.protonT(key) : key;
  };

  const format = function (text) {
    const args = Array.prototype.slice.call(arguments, 1);
    let i = 0;
    return text.replace(/%[ds]/g, function () {
      return String(args[i++]);
    });
  };

  const formatSize = function (bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " kB";
    return bytes + " B";
  };

  function patch(ui, fs, rpc, request) {
    const origUpload = ui.uploadFile;
    const origExecDirect = fs.exec_direct;
    const origRemove = fs.remove;

    if (
      typeof origUpload !== "function" ||
      typeof origExecDirect !== "function" ||
      typeof origRemove !== "function"
    ) {
      return;
    }

    const callInstall = rpc.declare({
      object: "luci.proton-packages",
      method: "installLocal",
      params: ["files", "overwrite"],
    });

    const callCleanup = rpc.declare({
      object: "luci.proton-packages",
      method: "cleanup",
      params: ["files"],
    });

    // The batch that is uploaded and waiting for the stock "Install" button:
    // { viewPath: the path the stock view asked for, paths: our upload paths }.
    let pending = null;

    const isPackageUploadPath = function (path) {
      return path === "/tmp/upload.apk" || path === "/tmp/upload.ipk";
    };

    // Replace the stock behaviour only when luci.proton-packages really answers
    // (plugin installed, rpcd restarted, ACL granted). Otherwise the page stays
    // exactly as LuCI ships it instead of getting a dialog that cannot install.
    callCleanup([]).then(hook, function () {});

    function hook() {
      ui.uploadFile = function (path, progressStatusNode, info) {
        if (!isPackageUploadPath(path)) {
          return origUpload.apply(this, arguments);
        }

        return uploadPackages(path);
      };

      fs.exec_direct = function (command, params) {
        if (
          pending &&
          command === PM_CALL &&
          Array.isArray(params) &&
          params[0] === "install" &&
          params.indexOf(pending.viewPath) !== -1
        ) {
          const batch = pending;
          pending = null;

          return callInstall(
            batch.paths,
            params.indexOf("--force-overwrite") !== -1,
          );
        }

        return origExecDirect.apply(this, arguments);
      };

      // The stock view removes its own upload path after Cancel / Install. Our
      // files live elsewhere: clean them up on Cancel, and keep the stock call
      // (the path it names does not exist in this flow) from raising an error.
      fs.remove = function (path) {
        if (isPackageUploadPath(path)) {
          if (pending && pending.viewPath === path) {
            const batch = pending;
            pending = null;
            callCleanup(batch.paths).catch(function () {});
          }

          return origRemove.apply(this, arguments).catch(function () {});
        }

        return origRemove.apply(this, arguments);
      };
    }

    function uploadPackages(viewPath) {
      const ext = viewPath.slice(viewPath.lastIndexOf(".") + 1);

      return new Promise(function (resolve, reject) {
        const list = E("ul", {});
        const input = E("input", {
          type: "file",
          accept: "." + ext,
          style: "display:none",
        });
        const uploadBtn = E(
          "button",
          {
            class: "btn cbi-button-action important",
            disabled: true,
          },
          [_("Upload")],
        );

        input.multiple = true;

        const selectedFiles = function () {
          return Array.prototype.slice.call(input.files || []);
        };

        const problem = function (files) {
          if (files.length > MAX_FILES) {
            return format(t("Too many files (at most %d)"), MAX_FILES);
          }

          const wrong = files.filter(function (file) {
            return !file.name.toLowerCase().endsWith("." + ext);
          });

          if (wrong.length) {
            return format(t("Only .%s files can be installed here"), ext);
          }

          return "";
        };

        input.addEventListener("change", function () {
          const files = selectedFiles();
          const issue = problem(files);

          dom_content(
            list,
            files.map(function (file) {
              return E("li", {}, [
                file.name.replace(/^.*[\\/]/, ""),
                " (" + formatSize(file.size) + ")",
              ]);
            }),
          );

          if (issue) {
            list.appendChild(E("li", { class: "errors" }, [issue]));
          }

          uploadBtn.disabled = !files.length || !!issue;

          if (!uploadBtn.disabled) {
            uploadBtn.focus();
          }
        });

        uploadBtn.addEventListener("click", function () {
          const files = selectedFiles();

          if (!files.length || problem(files)) {
            return;
          }

          send(files);
        });

        const send = function (files) {
          const paths = files.map(function (file, i) {
            return "/tmp/proton-upload-" + (i + 1) + "." + ext;
          });
          const total = files.reduce(function (sum, file) {
            return sum + file.size;
          }, 0);
          const progress = E(
            "div",
            { class: "cbi-progressbar", title: "0%" },
            E("div", { style: "width:0" }),
          );
          const status = E("p", {}, "");
          const replies = [];
          let done = 0;

          ui.showModal(_("Uploading file…"), [progress, status]);

          const setProgress = function (loadedInFile) {
            const percent = total ? ((done + loadedInFile) / total) * 100 : 100;

            progress.setAttribute("title", percent.toFixed(2) + "%");
            progress.firstElementChild.style.width = percent.toFixed(2) + "%";
          };

          let chain = Promise.resolve();

          files.forEach(function (file, i) {
            chain = chain.then(function () {
              status.textContent = format(
                t("Uploading %d of %d: %s"),
                i + 1,
                files.length,
                file.name.replace(/^.*[\\/]/, ""),
              );

              const data = new FormData();
              data.append("sessionid", rpc.getSessionID());
              data.append("filename", paths[i]);
              data.append("filedata", file);

              return request
                .post(L.env.cgi_base + "/cgi-upload", data, {
                  timeout: 0,
                  progress: function (pev) {
                    setProgress(pev.loaded || 0);
                  },
                })
                .then(function (res) {
                  const reply = res.json();

                  if (L.isObject(reply) && reply.failure) {
                    throw new Error(reply.message || reply.failure);
                  }

                  done += file.size;
                  replies.push(reply);
                });
            });
          });

          chain.then(
            function () {
              ui.hideModal();

              pending = { viewPath: viewPath, paths: paths };

              // The stock dialog shows name / size / checksums of what was
              // uploaded; checksums only make sense for a single file.
              const names = files.map(function (file) {
                return file.name.replace(/^.*[\\/]/, "");
              });
              const reply = { name: names.join(", "), size: total };

              if (replies.length === 1 && L.isObject(replies[0])) {
                reply.checksum = replies[0].checksum;
                reply.sha256sum = replies[0].sha256sum;
              }

              resolve(reply);
            },
            function (err) {
              ui.hideModal();
              callCleanup(paths).catch(function () {});
              ui.addNotification(
                null,
                E("p", _("Upload request failed: %s").format(err.message)),
              );
              reject(err);
            },
          );
        };

        ui.showModal(t("Upload packages"), [
          E(
            "p",
            {},
            t(
              "Select one or more package files. They are installed together in one step, so packages that depend on each other can be uploaded at once.",
            ),
          ),
          list,
          E("div", { style: "display:flex" }, [
            E("div", { class: "left", style: "flex:1" }, [
              input,
              E(
                "button",
                {
                  class: "btn cbi-button",
                  click: function () {
                    input.click();
                  },
                },
                [_("Browse…")],
              ),
            ]),
            E("div", { class: "right", style: "flex:1" }, [
              E(
                "button",
                {
                  class: "btn",
                  click: function () {
                    ui.hideModal();
                    reject(new Error(_("Upload has been cancelled")));
                  },
                },
                [_("Cancel")],
              ),
              " ",
              uploadBtn,
            ]),
          ]),
        ]);
      });
    }
  }

  // Replace the children of a node (the LuCI dom.content helper is not global).
  function dom_content(node, children) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }

    children.forEach(function (child) {
      node.appendChild(child);
    });
  }

  // --- bootstrap (last: everything above is defined by now) ---
  let activated = false;

  // The theme loads this file on every page, so it decides by itself: on a full
  // page load and after a client-side (SPA) navigation to System -> Software.
  const isPackagePage = function () {
    try {
      if (document.body && document.body.dataset.page === PAGE) return true;

      return (
        typeof L !== "undefined" &&
        !!L.env &&
        Array.isArray(L.env.dispatchpath) &&
        L.env.dispatchpath.join("-") === PAGE
      );
    } catch (e) {
      return false;
    }
  };

  const activate = function () {
    if (activated || typeof L === "undefined" || !isPackagePage()) return;

    activated = true;

    Promise.all([
      L.require("ui"),
      L.require("fs"),
      L.require("rpc"),
      L.require("request"),
    ])
      .then(function (mods) {
        patch(mods[0], mods[1], mods[2], mods[3]);
      })
      .catch(function () {
        activated = false;
      });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", activate);
  } else {
    activate();
  }

  window.addEventListener("proton-spa-navigated", activate);
})();
