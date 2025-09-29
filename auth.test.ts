import { validateLogin } from "./app/utilities/auth";

describe("Login Validation", () => {
    {/* === FOR USERNAME AND PASSWORD*/ }
    it("should succeed with correct credentials", () => {
        expect(validateLogin("adrianalejandro052004@gmail.com", "Test1234")).toBe(true);
    });

    it("should fail with wrong username", () => {
        expect(validateLogin("wrong@gmail.com", "Test1234")).toBe(false);
    });

    it("should fail with wrong password", () => {
        expect(validateLogin("adrianalejandro052004@gmail.com", "wrongpass")).toBe(false);
    });
});

