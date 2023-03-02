from nltk.corpus import stopwords
import re
from nltk.stem.snowball import SnowballStemmer
from nltk.tokenize import word_tokenize

class DataPreprocessing:

    def clean_text(text):
        """
          Clean content of the string.

          The parameters of the dataframe are the comments that are in column
          Message_content.

          Parameters
          ----------

          text : List of a String
              Is the new comment that needs to be classified

          Returns
          -------
          text : List of a String
              - remove any html tags (< /br> often found)
              - Keep only ASCII + European Chars and whitespace, no digits
              - remove single letter chars
              - convert all whitespaces (tabs etc.) to single wspace
              if not for embedding (but e.g. tdata-idata):
              - all lowercase
              - remove stopwords, punctuation and stemm
              - Tokenazitation and Lemmatization

         """

        stemmer = SnowballStemmer("english")
        stop_words = set(stopwords.words("english"))
        content = text
        content_clean = []
        for text in content:
            RE_WSPACE = re.compile(r"\s+", re.IGNORECASE)
            RE_TAGS = re.compile(r"<[^>]+>")
            RE_ASCII = re.compile(r"[^A-Za-zÀ-ž ]", re.IGNORECASE)
            RE_SINGLECHAR = re.compile(r"\b[A-Za-zÀ-ž]\b", re.IGNORECASE)
            text = re.sub(RE_TAGS, " ", str(text))
            text = re.sub(RE_ASCII, " ", text)
            text = re.sub(RE_SINGLECHAR, " ", text)
            text = re.sub(RE_WSPACE, " ", text)
            text = re.sub(r"what's", "what is ", text)
            text = re.sub(r"yuhhhh", " ", text)
            text = re.sub(r"yuh", " ", text)
            text = re.sub(r"yuhhhh", " ", text)
            text = re.sub(r"don't", "do not", text)
            text = re.sub(r"frr", " ", text)
            text = re.sub(r"cant", "cannot", text)
            text = re.sub(r"wtffff", "what the fuck", text)
            text = re.sub(r"wtf", "what the fuck", text)
            text = re.sub(r"plz", "pleaze", text)
            text = re.sub(r"uhhh", " ", text)
            text = re.sub(r"stfu", "shut the fuck up", text)
            text = re.sub(r"ofc", "of course", text)
            text = re.sub(r"wasn't", "was not", text)
            text = re.sub(r"i'm", "i am", text)
            text = re.sub(r"dont", "do not", text)
            text = re.sub(r"like", " ", text)
            text = re.sub(r"bitchh", "bitch", text)
            text = re.sub(r"realli", "really", text)
            text = re.sub(r"https tenor com view", " ", text)
            text = text.strip(' ')
            text = word_tokenize(text)
            text = [word.lower() for word in text]
            words_filtered = [
                stemmer.stem(word) for word in text if word not in stop_words
            ]
            text_clean = " ".join(words_filtered)
            content_clean.append(text_clean)
            text = content_clean
        return text
