let API_URL = 'https://provedordoc-1.onrender.com';
// Durante desenvolvimento local ou quando o app é servido em localhost/127.0.0.1,
// usar o backend local em uma porta alternativa porque 5000 já está ocupada.
const isLocalHost = typeof window !== 'undefined' &&
	(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
if (process.env.NODE_ENV === 'development' || isLocalHost) {
	API_URL = 'http://localhost:5001';
}
export default API_URL;
