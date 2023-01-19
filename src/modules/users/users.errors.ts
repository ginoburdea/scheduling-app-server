export const usersErrors = {
    isLoggedIn: {
        sessionNotFound: 'session not found',
        sessionExpired: 'session is expired',
        sessionHijacked: 'session was hijacked',
    },
    register: {
        emailInUse: 'email is already in use',
    },
    logIn: {
        userNotFound: 'email does not correspond to any user',
        wrongPassword: 'password is incorrect',
    },
}
