import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import { decodeShopId } from "../api";

/**
 * Bug Condition Exploration Test
 *
 * Property 1: Bug Condition — shopId perdido quando ref ausente na URL
 *
 * Este teste evidencia o bug: quando o usuário acessa a aplicação com ?ref=
 * e depois navega para uma rota sem ?ref=, o shopId é perdido.
 *
 * ESPERADO: Este teste DEVE FALHAR no código não corrigido.
 * A falha confirma que o bug existe.
 *
 * **Validates: Requirements 1.1, 1.2, 1.3**
 */

// Arbitrary that generates valid base64-decodable strings
// We generate simple ASCII strings and encode them to base64
const validBase64Arb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => {
    // Only keep strings that are valid for btoa (Latin1 range)
    try {
      btoa(s);
      return true;
    } catch {
      return false;
    }
  })
  .map((s) => ({ original: s, encoded: btoa(s) }));

describe("Bug Condition Exploration — shopId perdido quando ref ausente na URL", () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
    localStorage.clear();
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    localStorage.clear();
  });

  function setUrlSearch(search: string) {
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, search },
      writable: true,
      configurable: true,
    });
  }

  it("should return cached shopId when ?ref= is removed from URL (PBT)", () => {
    /**
     * **Validates: Requirements 1.1, 1.2, 1.3**
     *
     * Property: For any valid base64 shopId, if decodeShopId() is called
     * with ?ref=<encoded> and then called again without ?ref=,
     * the second call should return the same shopId (from localStorage cache).
     *
     * On UNFIXED code, the second call returns null — proving the bug.
     */
    fc.assert(
      fc.property(validBase64Arb, ({ original, encoded }) => {
        // Clean state
        localStorage.clear();

        // Step 1: Set URL with ?ref= and call decodeShopId()
        // URL-encode the base64 string to handle +, =, / characters properly
        setUrlSearch(`?ref=${encodeURIComponent(encoded)}`);
        const firstResult = decodeShopId();

        // Verify first call works correctly (decodes base64)
        expect(firstResult).toBe(original);

        // Step 2: Remove ?ref= from URL (simulates internal navigation)
        setUrlSearch("");
        const secondResult = decodeShopId();

        // Step 3: Assert the shopId is still available (from localStorage cache)
        // On UNFIXED code, this will be null — proving the bug exists
        expect(secondResult).toBe(original);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Preservation Tests (Property 2)
 *
 * Property 2: Preservation — Comportamento preservado para entradas com ref na URL
 *
 * Estes testes verificam o comportamento existente que DEVE ser preservado
 * após a correção do bug. Eles DEVEM PASSAR no código não corrigido.
 *
 * Observações no código não corrigido:
 * - decodeShopId() com ?ref=c2hvcDEyMw== retorna "shop123"
 * - decodeShopId() com ?ref=!!! (base64 inválido) retorna null
 * - decodeShopId() sem ?ref= e sem cache retorna null
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */

// Arbitrary that generates strings that are NOT valid base64
// These should cause atob() to throw
const invalidBase64Arb = fc
  .string({ minLength: 1, maxLength: 30 })
  .filter((s) => {
    try {
      atob(s);
      return false; // If atob succeeds, this is valid base64 — skip it
    } catch {
      return true; // atob threw — this is invalid base64
    }
  });

describe("Preservation — Comportamento preservado para entradas com ref na URL", () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
    localStorage.clear();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
    localStorage.clear();
  });

  function setUrlSearch(search: string) {
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, search },
      writable: true,
      configurable: true,
    });
  }

  it("should decode valid base64 ref and return atob(ref) for all valid inputs (PBT)", () => {
    /**
     * **Validates: Requirements 3.1, 3.2**
     *
     * Property: For all valid base64 ref values, decodeShopId() returns atob(ref).
     * The base64 value is URL-encoded in the query string (as it would be in a real URL),
     * so URLSearchParams correctly decodes it before atob() is applied.
     * This behavior must be preserved after the fix.
     */
    fc.assert(
      fc.property(validBase64Arb, ({ original, encoded }) => {
        localStorage.clear();
        // URL-encode the base64 string to handle +, =, / characters properly
        setUrlSearch(`?ref=${encodeURIComponent(encoded)}`);

        const result = decodeShopId();

        expect(result).toBe(original);
      }),
      { numRuns: 100 }
    );
  });

  it("should return null for invalid base64 ref without throwing (PBT)", () => {
    /**
     * **Validates: Requirements 3.1**
     *
     * Property: For all invalid (non-base64) ref values, decodeShopId()
     * returns null without throwing an exception.
     * The ref value is URL-encoded in the query string so URLSearchParams
     * decodes it faithfully before atob() is attempted.
     * This behavior must be preserved after the fix.
     */
    fc.assert(
      fc.property(invalidBase64Arb, (invalidRef) => {
        localStorage.clear();
        // URL-encode to ensure URLSearchParams decodes the exact invalid string
        setUrlSearch(`?ref=${encodeURIComponent(invalidRef)}`);

        // Must not throw
        const result = decodeShopId();

        expect(result).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it("should return null without ?ref= and without cache (PBT)", () => {
    /**
     * **Validates: Requirements 3.3, 3.4**
     *
     * Property: Without ?ref= in the URL and without any cached value
     * in localStorage, decodeShopId() returns null.
     * This behavior must be preserved after the fix.
     */
    fc.assert(
      fc.property(
        // Generate random search strings that do NOT contain ref=
        fc.string({ minLength: 0, maxLength: 20 }).filter((s) => !s.includes("ref=")),
        (randomSearch) => {
          localStorage.clear();
          // Ensure no trinity_shop_id in localStorage
          localStorage.removeItem("trinity_shop_id");

          // Set URL without ?ref= parameter
          const search = randomSearch.length > 0 ? `?other=${encodeURIComponent(randomSearch)}` : "";
          setUrlSearch(search);

          const result = decodeShopId();

          expect(result).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
