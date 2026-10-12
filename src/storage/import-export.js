/* ============================================================
   Import / Export workflow JSON

   Export: serialize state → download a .json file.
   Import: read a File → parse → migrate → validate → return.
   ============================================================ */

import { serializeWorkflow, validateWorkflowPayload } from "./schema.js";
import { migrate } from "./migrations.js";

export function exportWorkflowToFile(state, filename = "workflow.json") {
  const payload = serializeWorkflow(state);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return payload;
}

export function readWorkflowFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onerror = () => resolve({ ok: false, error: "Could not read file" });

    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(reader.result);
      } catch (err) {
        resolve({ ok: false, error: "File is not valid JSON" });
        return;
      }

      const migrated = migrate(parsed);
      const validation = validateWorkflowPayload(migrated);
      if (!validation.ok) {
        resolve({
          ok: false,
          error: validation.errors.join("\n"),
          errors: validation.errors,
        });
        return;
      }

      resolve({ ok: true, payload: migrated });
    };

    reader.readAsText(file);
  });
}
