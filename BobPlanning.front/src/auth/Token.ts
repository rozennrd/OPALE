const getTokenFromLocalStorage = () => {
    try {
      const accessTokenJSON = localStorage.getItem('accessToken');
      
      if (accessTokenJSON) {
        return accessTokenJSON;
      } else {
        console.error('Access token not found in localStorage.');
        return null;
      }
    } catch (error) {
      console.error('Error parsing access token from localStorage:', error);
      return null;
    }
  };
  
  export { getTokenFromLocalStorage };