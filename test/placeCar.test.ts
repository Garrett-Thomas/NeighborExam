import { describe, it, expect } from "vitest";
import { canPackRecursive } from "../src/findLocation";

describe('Basic Find Location Tests', () => {

    it("Should correctly place car", () => {

        const vehicles = Array(5).fill(2);
        const spaces = Array(1).fill(Array(5).fill(2));

        expect(canPackRecursive(vehicles, 0, spaces)).toBeTruthy();
    });


});
