import * as React from 'react';
import { AppStateContext } from '../components/AppStateProvider';

const SpeechRecognition = window['SpeechRecognition'] ?? window['webkitSpeechRecognition'];

export function useSpeechRecognition(handleTranscript: (str: string) => void) {
	const context = React.useContext(AppStateContext);
	const sr = React.useRef<SpeechRecognition>();
	const [listening, setListening] = React.useState(false);

	React.useEffect(initSpeechRecognition, [context.speechEnabled()]);

	function initSpeechRecognition() {
		if (context.speechEnabled()) {
			sr.current ??= new SpeechRecognition();
			sr.current.onstart = _onStart;
			sr.current.onend = _onEnd;
			sr.current.onerror = _onError;
			sr.current.onspeechend = _onSpeechEnd;
			sr.current.onresult = _onResult;
		}
		return stop;
	}

	function start() {
		sr.current?.start();
	}

	function stop() {
		sr.current?.abort();
	}

	function _onStart() {
		console.info("Listening for speech…");
		setListening(true);
	}

	function _onEnd() {
		console.info("Stopped listening.");
		setListening(false);
	}

	function _onError(err: SpeechRecognitionErrorEvent) {
		setListening(false);
		if (err.error === 'not-allowed') {
			context.provider.setState({ enableSpeech: false });
		} else if (err.error === 'aborted') {
			console.info("Listening canceled.");
		} else if (err.error === 'no-speech') {
			console.info("No speech detected.");
		} else {
			console.error(err);
		}
	}

	function _onSpeechEnd() {
		sr.current?.stop();
	}

	function _onResult(event: SpeechRecognitionEvent) {
		const transcript = event.results[0][0].transcript;
		console.info(`"${transcript}"`);
		handleTranscript(formatSpokenNumbers(transcript));
		setListening(false);
	}

	return [listening, start, stop] as const;
}

function formatSpokenNumbers(transcript: string) {
	if (transcript.match(/^[\d\s-+/]*$/g)) {
		return transcript.replace(/\D/g, '');
	} else {
		return transcript;
	}
}
