import { onBeforeUnmount, onMounted } from "vue";
import { isUsablePhone } from "@/utils/whatsapp.ts";

type FormControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function isFormControl(target: EventTarget | null): target is FormControl {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

function sanitizePersonName(value: string): string {
  return value.replace(/[^\p{L}\p{M}\s]/gu, "").replace(/\s{2,}/g, " ");
}

function validationMessage(control: FormControl): string {
  control.setCustomValidity("");

  const value = control.value;
  const trimmedValue = value.trim();

  if (
    control.required &&
    control instanceof HTMLInputElement &&
    !["checkbox", "radio", "file"].includes(control.type) &&
    !trimmedValue
  ) {
    return "Preencha este campo.";
  }

  if (
    control.required &&
    control instanceof HTMLTextAreaElement &&
    !trimmedValue
  )
    return "Preencha este campo.";

  if (
    control instanceof HTMLInputElement &&
    control.type === "tel" &&
    trimmedValue &&
    !isUsablePhone(trimmedValue)
  )
    return "Introduza um contacto válido.";

  if (
    control instanceof HTMLInputElement &&
    control.hasAttribute("data-person-name") &&
    trimmedValue &&
    !/^[\p{L}\p{M}]+(?:\s+[\p{L}\p{M}]+)*$/u.test(trimmedValue)
  )
    return "Use apenas letras, acentos e espaços.";

  const validity = control.validity;

  if (validity.valueMissing) return "Preencha este campo.";
  if (validity.typeMismatch) {
    if (control instanceof HTMLInputElement && control.type === "email")
      return "Introduza um email válido.";
    if (control instanceof HTMLInputElement && control.type === "url")
      return "Introduza um endereço válido, incluindo https://.";
    return "Introduza um valor válido.";
  }
  if (validity.patternMismatch)
    return control.title || "O formato introduzido não é válido.";
  if (validity.tooShort)
    return `Introduza pelo menos ${control.getAttribute("minlength")} caracteres.`;
  if (validity.tooLong)
    return `Introduza no máximo ${control.getAttribute("maxlength")} caracteres.`;
  if (validity.rangeUnderflow)
    return `O valor mínimo permitido é ${control.getAttribute("min")}.`;
  if (validity.rangeOverflow)
    return `O valor máximo permitido é ${control.getAttribute("max")}.`;
  if (validity.stepMismatch)
    return "Introduza um valor dentro do intervalo permitido.";
  if (validity.badInput) return "Introduza um valor válido.";

  return "";
}

function validate(control: FormControl, showState: boolean): void {
  if (!control.willValidate) return;

  const message = validationMessage(control);
  control.setCustomValidity(message);

  if (!showState) return;

  if (control.validity.valid) control.removeAttribute("aria-invalid");
  else control.setAttribute("aria-invalid", "true");
}

/**
 * Uniformiza a validação dos formulários sem obrigar cada ecrã a repetir a
 * mesma lógica. As restrições continuam declaradas no próprio controlo
 * (`required`, `type`, `pattern`, `min`, `max`, `minlength` e `maxlength`).
 */
export function useFrontendValidation(): void {
  function onInput(event: Event): void {
    if (!isFormControl(event.target)) return;
    if (
      event.target instanceof HTMLInputElement &&
      event.target.hasAttribute("data-person-name")
    )
      event.target.value = sanitizePersonName(event.target.value);
    validate(event.target, event.target.dataset.validationTouched === "true");
  }

  function onBlur(event: FocusEvent): void {
    if (!isFormControl(event.target)) return;
    event.target.dataset.validationTouched = "true";
    validate(event.target, true);
  }

  function onInvalid(event: Event): void {
    if (!isFormControl(event.target)) return;
    event.target.dataset.validationTouched = "true";
    validate(event.target, true);
  }

  onMounted(() => {
    document.addEventListener("input", onInput, true);
    document.addEventListener("change", onInput, true);
    document.addEventListener("blur", onBlur, true);
    document.addEventListener("invalid", onInvalid, true);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("input", onInput, true);
    document.removeEventListener("change", onInput, true);
    document.removeEventListener("blur", onBlur, true);
    document.removeEventListener("invalid", onInvalid, true);
  });
}
