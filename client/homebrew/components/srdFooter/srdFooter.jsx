import React from 'react';

/*
 * The SRD / trade-dress line. ART-DIRECTION.md: "The SRD 5.2.1 footer is on
 * every screen", and it is also the page's disclaimer that Mythforge is not a
 * Wizards of the Coast product. Same wording as the mocks' .foot row.
 */
const SrdFooter = ()=>
	<footer className='tide-foot'>
		Rules from SRD 5.2.1 (CC BY 4.0). TaleForge is not affiliated with, endorsed,
		sponsored, or approved by Wizards of the Coast. Art: original, TaleForge.
	</footer>;

export default SrdFooter;
