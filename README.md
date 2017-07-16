# JavaScript_NaiveSpamClassifier

<h2>Brief description:</h2>
	Naive Bayes implementation for classifying messages as spam or not spam.

Author:
	Carlos Domínguez García

Tested on:
	Google Chrome   - 59.0.3071.86
	Mozilla Firefox - 54.0

How it works:
	The training data is on the html. Once hit the training button, the data will be passed to the training agent.
	Now you can send a message to the agent to know if it is treated or not as spam. It will be displayed on the
	console.

Implementation details:
	This is a very simple implementation, the training part consist of getting the data and counting how many times
	each word is classify as spam and how many times as not spam. Also we need to know the total number of spam and
	not spam words. This way we can calculate the probability of a word appearing knowing that it is spam (or not)
	thanks to the Laplace rule:
	
	P(word="something" | spam=true)  = count("something" when spam is true)  / (total number of spam words).
	P(word="something" | spam=false) = count("something" when spam is false) / (total number of not spam words).

	(So for simplicity we are assuming that the appareance of words in a message are
	conditionally independent random variables).

	For a message, the probability of it being spam would be the calculate multiplying the probability of each
	word. However, when using the application if a word doesn't exist in our bag of words, it probability would be
	zero (because the count would be zero) and the probability of that message being spam would also be zero. That
	is why we apply Laplace smoothing to calculate the probabilities. With a fixed k=1 to keep the program simple.
	Because of the smoothing, we also need the number of different words to calculate the probability:

	P(word="something" | spam=true) = (count("something" when spam is true) + 1) /
									  ((total number of spam words) + 1*(number of different words)).

	Finally, to give our answer we have to calculate the probability of spam knowing the input message, 
	P(spam=true | message="something"). Aplying Bayes rule, we get:

	P(spam=true | message="something") = ( P(message="something" | spam=true) * P(spam=true) ) / 
										 ( P(message="something") )

	The way that we did it was not calculating the whole expression, but only the numerator of P(spam=true | message="something")
	and P(spam=false | message="something"). Because the denominators are the same and the two need to sum up to one, we
	can just compare the numerators to give our answer.
