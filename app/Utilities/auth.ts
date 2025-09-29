export function validateLogin(username: string, password: string): boolean {
    const validUsername = "adrianalejandro052004@gmail.com";
    const validPassword = "Test1234";

    return username === validUsername && password === validPassword;
}