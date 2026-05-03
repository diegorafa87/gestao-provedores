let API_URL = 'https://provedordoc-1.onrender.com';
if (process.env.NODE_ENV === 'development') {
	API_URL = 'http://localhost:5001';
}
export default API_URL;
