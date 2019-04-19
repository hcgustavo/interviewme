const firebase = require("nativescript-plugin-firebase/app");
import BackendService from './BackendService';

const backendService = new BackendService();

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

    saveUserInterview(answers) {
        let uploadPromises = [];
        answers.forEach(answer => {
            let file = answer.answer_file;
            uploadPromises.push(firebase.storage().ref().child('answers/' + file.name).put(file));
        });
        return Promise.all(uploadPromises)
        .then(uploadResults => {
            let downloadUrlPromises = [];
            uploadResults.forEach((uploadRes, index) => {
                downloadUrlPromises.push(firebase.storage().ref().child(`answers/${answers[index].answer_file.name}`).getDownloadURL());
            });
            return Promise.all(downloadUrlPromises)
        })
        .then(downlodUrlResults => {
            let docs = [];
            downlodUrlResults.forEach((downloadUrlRes, index) => {
                docs.push({
                    downloadUrl: downloadUrlRes,
                    name: `answers/${answers[index].answer_file.name}`
                });
            });
            let docPromises = [];
            docs.forEach(doc => {
                docPromises.push(firebase.firestore().collection('answers').add(doc));
            });
            return Promise.all(docPromises)
        })
        .then(docsResult => {
            let answersId = [];
            docsResult.forEach((doc, index) => {
                answersId.push(doc.id);
            })
            return firebase.firestore().collection('interviews').add({
                questions: answers.map(a => a.question_id),
                answers: answersId
            });
        })
        .then(interviewResult => {
            return firebase.firestore().collection('users').doc(backendService.token).update({
                interviews: firebase.firestore().FieldValue().arrayUnion(interviewResult.id)
            });
        })
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