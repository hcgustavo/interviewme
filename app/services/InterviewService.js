const firebase = require("nativescript-plugin-firebase/app");
import BackendService from './BackendService';

const backendService = new BackendService();

export default class InterviewService {

    /**
     * Load the amount of questions as requested by the user
     */
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

    /**
     * Save user's interview session on Firestore
     */
    saveUserInterview(answers) {
        // Upload user's answers audio files to Storage
        let uploadPromises = [];
        answers.forEach(answer => {
            let file = answer.answer_file;
            uploadPromises.push(firebase.storage().ref().child('answers/' + file.name).put(file));
        });
        return Promise.all(uploadPromises)
        .then(uploadResults => {
            // Get download URL for the user's answers
            let downloadUrlPromises = [];
            uploadResults.forEach((uploadRes, index) => {
                downloadUrlPromises.push(firebase.storage().ref().child(`answers/${answers[index].answer_file.name}`).getDownloadURL());
            });
            return Promise.all(downloadUrlPromises)
        })
        .then(downlodUrlResults => {
            // Create user's answers register o Firestore (file name + download url)
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
            // Create user's interview session on Firestore
            let answersId = [];
            docsResult.forEach((doc, index) => {
                answersId.push(doc.id);
            })
            return firebase.firestore().collection('interviews').add({
                questions: answers.map(a => a.question_id),
                answers: answersId,
                created: new Date().toString()
            });
        })
        .then(interviewResult => {
            // Save user's interview id on user's register on Firestore
            return firebase.firestore().collection('users').doc(backendService.token).update({
                interviews: firebase.firestore().FieldValue().arrayUnion(interviewResult.id)
            });
        })
    }

    /**
     * Load user's interview sessions
     */
    loadUserInterviews() {
        return firebase.firestore().collection('users').doc(backendService.token).get()
        .then(docSnapshot => {
            let interviewsIds = [];
            if(docSnapshot.exists) {
                interviewsIds = [...docSnapshot.data().interviews];
            }
            return interviewsIds;
        })
        .then(interviewsIds => {
            let interviewsPromises = [];
            interviewsIds.forEach(interviewId => {
                interviewsPromises.push(firebase.firestore().collection('interviews').doc(interviewId).get());
            });
            return Promise.all(interviewsPromises);
        })
        .then(interviews => {
            return interviews.map(i => i.data());
        })
    }

    /**
     * Load an user's interview session
     */
    loadUserInterview(interview) {
        let questions = [];
        let answers = [];

        let questionsPromises = [];
        interview.questions.forEach(question => {
            questionsPromises.push(firebase.firestore().collection('questions').doc(question).get());
        });
        return Promise.all(questionsPromises)
        .then(questionsResult => {
            questionsResult.forEach(qr => {
                questions.push(qr.data());
            })

            let answersPromises = [];
            interview.answers.forEach(answer => {
                answersPromises.push(firebase.firestore().collection('answers').doc(answer).get());
            });
            return Promise.all(answersPromises);
        })
        .then(answersResult => {
            answersResult.forEach(ar => {
                answers.push(ar.data());
            })
            return {
                questions: questions,
                answers: answers
            }
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