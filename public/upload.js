
/* upload.js */

window.addEventListener('DOMContentLoaded', () => {
	console.log('DOMContentLoaded')

	/* Show message for time period */
	if(document.querySelector('.msg')) {
		const msgDisplayTime = 4000 // Longer delay - long error messages
		document.querySelector('.msg').hidden = false
		window.setTimeout( () => {
			document.querySelector('.msg').hidden = true
		}, msgDisplayTime)
	}
})

const uploadForm = document.querySelector('form')
uploadForm.reset() // Reset the form if refreshed

const tracksInput = document.querySelector('#tracksInput')
const trackInputLBL = document.querySelector('.trackInputLBL')

console.log(tracksInput.files)

const tracksSelectedInfo= document.querySelector('.tracksSelectedInfo')

/* Display selected files info */
tracksInput.addEventListener('change', async() => {
	console.log('File input changed')
	const selectedFiles = tracksInput.files

	if(selectedFiles.length === 0) {
		console.log('No files selected')
		tracksSelectedInfo.textContent = 'You have no selected tracks to upload.'
	} else {
		console.log(`${selectedFiles.length} files selected`)
		tracksSelectedInfo.textContent = `You have ${selectedFiles.length} selected tracks to upload.`
	}
})

/* Event - https://developer.mozilla.org/en-US/docs/Web/API/Event */
/* Empty the selected files when the user goes to select files */
trackInputLBL.onclick = async() => {
	tracksInput.value = null // Empty the files selected
	const changeEvent = new Event('change')
	tracksInput.dispatchEvent(changeEvent)
}
