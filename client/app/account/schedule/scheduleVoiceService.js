'strict'

angular.module('schedulerApp')
    .factory('scheduleVoiceService', function() {
    		//inernal speak function (for other functions in the factory)
    		function speakFu(text, callback) {
		        var u = new SpeechSynthesisUtterance();
		        u.text = text;
		        u.lang = 'en-US';
		     
		        u.onend = function () {
		            if (callback) {
		                callback();
		            }
		        };
		     
		        u.onerror = function (e) {
		            if (callback) {
		                callback(e);
		            }
		        };		     
		        speechSynthesis.speak(u);
		    }
		    //internal ask function (to use by other functions inside the factory)
		    function askFu(text, callback) {
		        // ask question
			        speakFu(text, function () {
			            // get answer
			            var recognition = new webkitSpeechRecognition();
			            recognition.continuous = false;
			            recognition.interimResults = false;
			     
			            recognition.onend = function (e) {
			                if (callback) {
			                    callback('no results');
			                }
			            }; 
			     
			            recognition.onresult = function (e) {
			                // cancel onend handler
			                recognition.onend = null;
			                if (callback) {
			                    callback(null, {
			                        transcript: e.results[0][0].transcript,
			                        confidence: e.results[0][0].confidence
			                    });
			                }
			            }
			     
			            // start listening
			            recognition.start();
		        	});
		    	}
	    // factory functions for scheduleController
	        return {
	        	speak: function (text, callback) {
			        var u = new SpeechSynthesisUtterance();
			        u.text = text;
			        u.lang = 'en-US';
			     
			        u.onend = function () {
			            if (callback) {
			                callback();
			            }
			        };
			     
			        u.onerror = function (e) {
			            if (callback) {
			                callback(e);
			            }
			        };
			     
			        speechSynthesis.speak(u);
			    },
		    	//simple ask function
		    	ask: function (text, callback) {
		        // ask question
			        speakFu(text, function () {
			            // get answer
			            var recognition = new webkitSpeechRecognition();
			            recognition.continuous = false;
			            recognition.interimResults = false;
			     
			            recognition.onend = function (e) {
			                if (callback) {
			                    callback('no results');
			                }
			            }; 
			     
			            recognition.onresult = function (e) {
			                // cancel onend handler
			                recognition.onend = null;
			                if (callback) {
			                    callback(null, {
			                        transcript: e.results[0][0].transcript,
			                        confidence: e.results[0][0].confidence
			                    });
			                }
			            }
			     
			            // start listening
			            recognition.start();
		        	});
		    	}
			}
    	});