const firebase = require("nativescript-plugin-firebase/app");

export default class InterviewService {

    loadQuestions(numberOfQuestions) {
        return firebase.firestore().collection("questions").get()
        .then(querySnapshot => {
            return querySnapshot;
        })
        .then(querySnapshot => {
            let allQuestions = [];
            querySnapshot.forEach(doc => {
                let tmp = doc.data();
                tmp.id = doc.id;
                allQuestions.push(tmp);
            });
            return getRandomQuestions(allQuestions, numberOfQuestions);
        });
    }

    saveUserInterview(interview) {

    }
    
}

const getRandomQuestions = function(questions, numberToSelect) {
    let total = questions.length;
    let selectedQuestions = [];

    if(total < numberToSelect) {
        numberToSelect = total;
    }

    while(selectedQuestions.length < numberToSelect) {
        let index = Math.floor(Math.random() * total);
        if(!selectedQuestions.includes(questions[index])) {
            selectedQuestions.push(questions[index]);
        }
    }
    return selectedQuestions;
}