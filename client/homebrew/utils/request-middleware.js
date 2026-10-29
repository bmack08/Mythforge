import request from 'superagent';
import { prefixPath } from './basePath.js';

const addHeader = (request)=>request.set('Homebrewery-Version', global.version);

const requestMiddleware = {
	get    : (path)=>addHeader(request.get(prefixPath(path))),
	put    : (path)=>addHeader(request.put(prefixPath(path))),
	post   : (path)=>addHeader(request.post(prefixPath(path))),
	delete : (path)=>addHeader(request.delete(prefixPath(path))),
};

export default requestMiddleware;