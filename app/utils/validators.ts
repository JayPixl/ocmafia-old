export const validateEmail = (email: string): string | undefined => {
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!email.length || !validRegex.test(email)) {
        return "Please enter a valid email address"
    }
}

export const validatePassword = (password: string): string | undefined => {
    if (password.length < 8) return "Please enter a password that is at least 8 characters long"
    if (password.length > 20) return "Password cannot be more than 20 characters long"
}

export const validateUsername = (name: string): string | undefined => {
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    if (name.length < 5) return `Username must be at least 5 characters long`
    if (name.length > 15) return `Username cannot be more than 15 characters long`
    if (!usernameRegex.test(name)) return `Username can only contain alphanumeric characters`
}