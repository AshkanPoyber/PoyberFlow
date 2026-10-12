/* ============================================================
   Workflow Menu — Save, Export, Import buttons for the top bar.
   ============================================================ */

import { el } from "../../utils/dom.js";
import {
  exportWorkflowToFile,
  readWorkflowFile,
} from "../../storage/import-export.js";
import { saveWorkflow } from "../../storage/local.js";
import { showImportErrorDialog } from "../panels/import-dialog.js";
import { CURRENT_VERSION } from "../../storage/schema.js";

function menuButton({ icon, label, onClick, variant = "ghost" }) {
  const base =
    "focus-ring h-8 px-2.5 rounded-md flex items-center gap-1.5 border text-[12px] font-medium transition-colors";
  const styles =
    variant === "primary"
      ? "border-transparent bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]"
      : "border-border bg-surface text-secondary hover:bg-elevated hover:text-primary";
  return el(
    "button",
    {
      type: "button",
      class: `${base} ${styles}`,
      title: label,
      onclick: onClick,
    },
    [
      el("i", { class: `${icon} text-[11px]` }),
      el("span", { class: "hidden sm:inline" }, label),
    ],
  );
}

export function createWorkflowMenu({ store, toast, rootEl }) {
  const fileInput = el("input", {
    type: "file",
    accept: ".json,application/json",
    style: { display: "none" },
  });

  async function onFileSelected(event) {
    const file = event.target.files?.[0];
    event.target.value = ""; // reset so same file can be re-selected
    if (!file) return;

    const result = await readWorkflowFile(file);

    if (!result.ok) {
      const errors = result.errors || [];
      // Long lists or version issues go to a dialog.
      const looksSerious =
        errors.length > 2 ||
        /newer than supported/i.test(result.error) ||
        /not valid JSON/i.test(result.error);

      if (looksSerious) {
        showImportErrorDialog(rootEl, {
          title: "Import failed",
          message:
            "This file could not be imported. Details below — no changes were made.",
          errors,
        });
      } else {
        toast.show({
          kind: "error",
          text: result.error || "Import failed",
          duration: 5000,
        });
      }
      return;
    }

    applyImportedPayload(store, result.payload);
    toast.show({ kind: "success", text: "Workflow imported" });
  }

  function applyImportedPayload(store, payload) {
    const { workflow, viewport } = store.getState();
    store.setState({
      workflow: {
        ...workflow,
        metadata: {
          ...workflow.metadata,
          ...payload.metadata,
          version: CURRENT_VERSION,
        },
        nodes: payload.workflow.nodes,
        edges: payload.workflow.edges,
      },
      viewport: {
        x: payload.viewport?.x ?? viewport.x,
        y: payload.viewport?.y ?? viewport.y,
        zoom: payload.viewport?.zoom ?? viewport.zoom,
      },
      selection: { nodeIds: [], edgeIds: [] },
    });
  }

  fileInput.addEventListener("change", onFileSelected);

  const saveBtn = menuButton({
    icon: "fa-regular fa-floppy-disk",
    label: "Save",
    variant: "primary",
    onClick: () => {
      const result = saveWorkflow(store.getState());
      if (result.ok) {
        toast.show({ kind: "success", text: "Workflow saved" });
      } else {
        toast.show({
          kind: "error",
          text: result.error || "Save failed",
        });
      }
    },
  });

  const exportBtn = menuButton({
    icon: "fa-solid fa-arrow-up-from-bracket",
    label: "Export",
    onClick: () => {
      exportWorkflowToFile(store.getState(), "workflow.json");
      toast.show({ kind: "success", text: "Workflow exported" });
    },
  });

  const importBtn = menuButton({
    icon: "fa-solid fa-arrow-down-to-bracket",
    label: "Import",
    onClick: () => fileInput.click(),
  });

  const root = el("div", { class: "flex items-center gap-1.5" }, [
    saveBtn,
    el("div", { class: "w-px h-5 bg-[var(--color-border)] mx-1" }),
    exportBtn,
    importBtn,
    fileInput,
  ]);

  return root;
}
