//Token storage utilities to match BobPlanning.front implementation*/


const TOKEN_KEY = 'authToken';


//Get token from localStorage

export const getTokenFromLocalStorage = (): string | null => {
    try {
        const token = localStorage.getItem(TOKEN_KEY);
        return token;
    } catch (error) {
        console.error('Error getting token from localStorage:', error);
        return null;
    }
};


// Set token in localStorage

export const setTokenInLocalStorage = (token: string): void => {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.error('Error setting token in localStorage:', error);
    }
};




//Remove token from localStorage*/

export const removeTokenFromLocalStorage = (): void => {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error removing token from localStorage:', error);
    }
};