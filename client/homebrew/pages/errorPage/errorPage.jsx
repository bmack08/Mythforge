import './errorPage.less';
import React from 'react';
import UIPage from '../basePages/uiPage/uiPage.jsx';
import { ensureJson, toHTML } from 'shared/contentAdapter.js';
import ErrorIndex from './errors/errorIndex.js';

const ErrorPage = ({ brew })=>{
	// Retrieving the error text based on the brew's error code from ErrorIndex
	const errorText = ErrorIndex({ brew })[brew.HBErrorCode.toString()] || '';

	// Convert text to TipTap JSON and render
	const jsonDoc = ensureJson(errorText);
	const html = toHTML(jsonDoc);

	return (
		<UIPage brew={{ title: 'Crit Fail!' }}>
			<div className='dataGroup'>
				<div className='errorTitle'>
					<h1>{`Error ${brew?.status || '000'}`}</h1>
					<h4>{brew?.text || 'No error text'}</h4>
				</div>
				<hr />
				<div dangerouslySetInnerHTML={{ __html: html }} />
			</div>
		</UIPage>
	);
};

export default ErrorPage;
