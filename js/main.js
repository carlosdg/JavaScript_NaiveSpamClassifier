"use strict";

function calcProbability (numberFavourableCases, numberTotalCases, numberOfPossibleValues){
    // We'll use laplace smoothing with a fix k=1
    // to prevent zeros to ruin the results
    return ( (numberFavourableCases + 1.0) /
             (numberTotalCases + numberOfPossibleValues));
}

function stringToWords (str){
    // The regular expresion matches to any word
    // and ignores the rest of non-words, this
    // way we only have valid words in the resulting
    // array
    return str.match(/\w*[^\W*]/g);
}


// -------------------------------------------------------------------- //


// Constructor function
function BagOfWords (numWordTypes){

    this.numberWordTypes = numWordTypes;

    // These counters keep track of the number of words of type i,
    // for all types. For example, how many words are classified as
    // spam (type 1) and not spam (type 2)
    // Note: it has to be read as this.totalNumberOfWordsOfType[wordType]
    this.totalNumberOfWordsOfType = new Array (numWordTypes);
    for (var i = 0; i < numWordTypes; ++i)
        this.totalNumberOfWordsOfType[i] = 0;

    // And here we'll have the counts for a particular word
    // We count the number of times that word was classified
    // as [type1, type2...]
    // For example, for a word w, how many times it appeared
    // in a spam messages and how many times in non-spam messages.
    this.wordCounters = new AssociativeArray();
}

BagOfWords.prototype.addSingleWord = function(word, wordType){

    // To be case insensitive
    word = word.toLowerCase();

    var counters = this.wordCounters.getValue(word);

    // If counters is null, the word is new, so we have to create
    // a new element in the associative array for it
    if (counters === null){
        counters = new Array(this.numberWordTypes);
        for (var i = 0, length = this.numberWordTypes; i < length; ++i){
            counters[i] = 0;
        }
        counters[wordType] += 1;
        this.totalNumberOfWordsOfType[wordType] += 1;
        this.wordCounters.setValue(word, counters);
    }
    else {
        counters[wordType] += 1;
        this.totalNumberOfWordsOfType[wordType] += 1;
    }


}

BagOfWords.prototype.addString = function(str, wordType){
    var wordsArray = stringToWords(str);
    for (var i = 0, length = wordsArray.length; i < length; ++i)
        this.addSingleWord(wordsArray[i], wordType);
}

// Returns how many words of type wordType are in the associative array.
BagOfWords.prototype.getCountOfWord = function(word, wordType){
    var counter = this.wordCounters.getValue(word);
    if (counter === null)
        return 0;
    else
        return counter[wordType];
}

// Returns how many different words are in the associative array
// no matter what type
BagOfWords.prototype.getNumDifferentWords = function(){
    return this.wordCounters.length();
}


// -------------------------------------------------------------------- //


// Enum
var TextType = {
    SPAM : 0,
    NOT_SPAM : 1
};



// -------------------------------------------------------------------- //


var intelligentAgent = (function(){
    // Variables needed for probability calculation.
    // In the bag we'll have the count of the words
    // given that it is spam or not and the total
    // number of spam and not spam. This way we can
    // easily compute P(W=word|SPAM) and P(W=word|NotSPAM)
    var bagOfWords    = new BagOfWords(2),
        spamProbability = 0.0;

    // Fixed epsilon for comparing floating points
    var EPS = 10E-9;

    return({
        train : function(){
            // Variables to retreive the data for training
            // messages have the content of the messages and
            // messageType tells us if it is spam or not
            var messages = document.getElementsByClassName("message-content"),
                messageType = document.getElementsByClassName("message-type");

            // These are auxiliar variables to calculate the
            // spam and not spam probability
            var numberOfSpamMessages = 0,
                totalNumberOfMessages = messages.length;

            // The training part is very easy, we just have to fill
            // the bag of words. TODO: Use the 80% of the training data
            // to train and the rest to test.
            for (var i = 0, size = messages.length; i < size; ++i){
                if (messageType[i].children[0].checked){ // If the spam option is checked...
                    // Add the message to the bag and increment spam counter
                    bagOfWords.addString(messages[i].innerText, TextType.SPAM);
                    numberOfSpamMessages += 1;
                }
                else //not spam
                    bagOfWords.addString(messages[i].innerText, TextType.NOT_SPAM);
            }

            // Now we can calculate the spam probability
            spamProbability = calcProbability(numberOfSpamMessages, totalNumberOfMessages, 2);

        },
        checkForSpam : function(message){
            var wordsArray = stringToWords(message);
            var pMessageGivenSpam = 1.0,    // P(M=m|Spam=true)
                pMessageGivenNotSpam = 1.0  // P(M=m|Spam=false)

            // First we compute the probability of the messages by multipling
            // the probability of all the words given Spam. Keeping in mind
            // the laplace smoothing, that's why we also need the number of
            // different words
            for (var i = 0, length = wordsArray.length; i < length; ++i){
                pMessageGivenSpam *= calcProbability(
                    bagOfWords.getCountOfWord(wordsArray[i], TextType.SPAM),
                    bagOfWords.totalNumberOfWordsOfType[ TextType.SPAM ],
                    bagOfWords.getNumDifferentWords(),
                );
                pMessageGivenNotSpam *= calcProbability(
                    bagOfWords.getCountOfWord(wordsArray[i], TextType.NOT_SPAM),
                    bagOfWords.totalNumberOfWordsOfType[ TextType.NOT_SPAM ],
                    bagOfWords.getNumDifferentWords(),
                );
            }
            console.log("\nP(Spam=true) = " + spamProbability);
            console.log("\nP(M=m|Spam=true) = " + pMessageGivenSpam);
            console.log("P(M=m|Spam=false) = " + pMessageGivenNotSpam);

            // Now we can calculate P'(Spam=true|M=m) = P(M=m|Spam=true) * P(Spam=true) [a]
            // and P'(Spam=false|M=m) = P(M=m|Spam=false) * P(Spam=false) [b]
            // and because (P'(Spam=true|M=m) + P'(Spam=false|M=m))/alpha = 1
            // we can just determine that the higher probability will we the most likely,
            // so that'll the answer
            pMessageGivenSpam *= spamProbability;
            pMessageGivenNotSpam *= (1 - spamProbability);

            console.log("\nP'(Spam=true|M=m) = " + pMessageGivenSpam);
            console.log("P'(Spam=false|M=m) = " + pMessageGivenNotSpam + '\n');
            console.log(bagOfWords);

            if (pMessageGivenSpam > pMessageGivenNotSpam + EPS)
                console.log("spam");
            else
                console.log("not spam");


        }
    });// end return
})();// end object


function main(){
    var trainAgentButton = document.getElementById("train-agent-button"),
        submitMessageButton = document.getElementById("submit-message-button"),
        testMessageBox = document.getElementById("message-to-test");

    trainAgentButton.onclick = function(){
        this.disabled = true;
        this.onclick = null;
        intelligentAgent.train();
    }
    submitMessageButton.onclick = function(){
        var testMessage = testMessageBox.value.toLowerCase();
        console.log("\n\n\n" + testMessage + '\n\n');
        intelligentAgent.checkForSpam( testMessage );
    }

}

main();
