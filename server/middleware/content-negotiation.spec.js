import contentNegotiationMiddleware from './content-negotiation.js';

describe('content-negotiation-middleware', ()=>{
	let request;
	let response;
	let next;

	beforeEach(()=>{
		request = {
			get : function(key) {
				return this[key];
			}
		};
		response = {
			status : jest.fn(()=>response),
			send   : jest.fn(()=>{})
		};
		next = jest.fn();
	});

	it('should return 406 on image request', ()=>{
		contentNegotiationMiddleware({
			Accept : 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
			...request
		}, response);

		expect(response.status).toHaveBeenLastCalledWith(406);
		expect(response.send).toHaveBeenCalledWith({
			message : 'Request for image at this URL is not supported'
		});
	});

	/* UNIT M5. Chrome's webfont Accept weights every part, so the
	 * unweighted-parts filter leaves an empty list - and `[].every()` is true.
	 * This server was answering 406 to every @font-face it hosts, which is why
	 * document.fonts reported eleven families in error, the rune ICON fonts
	 * (Davek, Iokharic, Rellanic) among them. */
	it('should call next on a webfont request whose Accept parts are all weighted', ()=>{
		contentNegotiationMiddleware({
			Accept : 'application/font-woff2;q=1.0,application/font-woff;q=0.9,*/*;q=0.8',
			...request
		}, response, next);

		expect(next).toHaveBeenCalled();
		expect(response.status).not.toHaveBeenCalled();
	});

	it('should call next when there is no Accept header at all', ()=>{
		contentNegotiationMiddleware({ ...request }, response, next);

		expect(next).toHaveBeenCalled();
		expect(response.status).not.toHaveBeenCalled();
	});

	it('should call next on non-image request', ()=>{
		contentNegotiationMiddleware({
			Accept : 'text,image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
			...request
		}, response, next);

		expect(next).toHaveBeenCalled();
	});
});
