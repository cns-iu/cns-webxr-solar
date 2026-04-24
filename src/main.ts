import './style.css';
import { App } from './App';

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	const app = new App();
	void app.init().catch((error) => {
		console.error('App initialization failed', error);
	});
}); 
