<template>
    <Page actionBarHidden="true" @loaded="onPageLoaded">
        <GridLayout rows="auto, auto, *">
            <Image 
            src="~/assets/images/man-boss.png" 
            class="boss" 
            horizontalAlignment="center"
            row="0" />

            <Label
            class="status"
            horizontalAlignment="center"
            v-model="status"
            row="1" />

            <DockLayout stretchLastChild="false" row="2">
                <Button 
                dock="bottom" 
                class="record-btn fa-solid"
                :text="microphoneIcon" 
                :isEnabled="canRecord"
                v-show="!isRecording"
                @tap="recordAnswer" />
                <Button 
                dock="bottom" 
                class="stop-btn fa-solid"
                :text="stopIcon" 
                v-show="isRecording"
                @tap="stopRecording" />
            </DockLayout>
        </GridLayout>
    </Page>
</template>

<script>
import Main from './Main';
import BackendService from '../services/BackendService';
import InterviewService from '../services/InterviewService';
import CountdownModal from './CountdownModal';
import * as FontAwesome from '../utils/font-awesome';
import { File, knownFolders } from 'tns-core-modules/file-system';
import { TNSRecorder } from 'nativescript-audio';
import MyLoadingIndicator from '../utils/loading-indicator';

const dialogs = require("tns-core-modules/ui/dialogs");
const audio = require('nativescript-audio');

const backendService = new BackendService();
const interviewService = new InterviewService();
const player = new audio.TNSPlayer();
const recorder = new audio.TNSRecorder();
const loadingIndicator = new MyLoadingIndicator();

export default {
    props: ['questions'],

    data() {
        return {
            status: "",
            canRecord: false,
            isRecording: false,
            lastRecordedAudioName: "",
            lastRecordedAudioPath: "",
            currentQuestionIndex: 0,
            answers: [],

            // Icons
            microphoneIcon: FontAwesome.getIcon(FontAwesome.Icon.MICROPHONE),
            stopIcon: FontAwesome.getIcon(FontAwesome.Icon.STOP),
        }
    },

    methods: {
        onPageLoaded() {
            this.$showModal(CountdownModal, {fullscreen: true})
            .then(() => {
                this.playQuestion(this.questions[this.currentQuestionIndex]);
            })
        },

        playQuestion(question) {
            this.status = "En train d'écouter la question...";
            this.canRecord = false;

            player.playFromUrl({
                audioFile: question.downloadUrl,
                loop: false,
                completeCallback: () => {
                    console.log("Audio completed playing...");
                    this.canRecord = true;
                    this.status = "Enregistrez votre réponse";
                },
                errorCallback: (error) => {
                    alert("Une erreur s'est produite");
                    console.error(JSON.stringify(error));
                },
                infoCallback: (args) => {
                    console.log(JSON.stringify(args));
                }
            })
            .then(res => {
                console.log("Playing audio...");
            })
            .catch(error => {
                console.log("Could not play audio: " + error);
                alert("Une erreur s'est produite");
            })
        },

        recordAnswer() {
            if(!TNSRecorder.CAN_RECORD()) {
                alert("Cet appareil ne peut pas engistrer d'audio");
                return;
            }

            const audioFolder = knownFolders.currentApp().getFolder('audio');

            this.lastRecordedAudioName = `${backendService.token}_${Date.now().toString()}.m4a`;
            this.lastRecordedAudioPath = `${audioFolder.path}/${this.lastRecordedAudioName}`;

            this.isRecording = true;
            recorder.start({
                filename: this.lastRecordedAudioPath,
                format: 2, //android.media.MediaRecorder.OutputFormat.MPEG_4
                encoder: 3, //android.media.MediaRecorder.AudioEncoder.AAC
                metering: false,
                infoCallback: info => {
                    console.log(JSON.stringify(info));
                },
                errorCallback: error => {
                    console.error(JSON.stringify(error));
                    this.isRecording = false;
                }
            })
            .then(res => {
                console.log("Recording...");
            })
            .catch(error => {
                this.isRecording = false;
                console.error("Error recording: " + error);
            })

        },

        stopRecording() {
            recorder.stop().then((res) => {
                console.log("Stopped recording");
                this.isRecording = false;
                this.answers.push({
                    question_id: this.questions[this.currentQuestionIndex].id,
                    answer_file: this.getFile()
                })

                if(this.currentQuestionIndex === this.questions.length - 1) {
                    // End session
                    loadingIndicator.show("En train de téléverser vos réponses...");

                    // Upload user's answers
                    interviewService.uploadUserAnswers(this.answers)
                    .then(results => {
                        loadingIndicator.hide();
                        dialogs.alert({
                        title: "Bon travail!",
                        message: "Votre entrevue a été enrigistré avec succès.",
                        okButtonText: "OK"
                        }).then(() => {
                            // Go to main page
                            this.$navigateTo(Main, {clearHistory: true});
                        })
                    })
                    .catch(error => {
                        loadingIndicator.hide();
                        console.error("Error uploading answers: " + error);
                        alert("Error uploading answers");
                    })
                } else {
                    this.currentQuestionIndex++;
                    this.$showModal(CountdownModal, {fullscreen: true})
                    .then(() => {
                        this.playQuestion(this.questions[this.currentQuestionIndex]);
                    })   
                }
            })
            .catch(error => {
                console.error("Error stopping recording: " + error);
            })
        },

        getFile() {
            const audioFolder = knownFolders.currentApp().getFolder('audio');
            const recordedFile = audioFolder.getFile(this.lastRecordedAudioName);
            return recordedFile;
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../app.scss';

.boss {
    width: 200;
    height: 200;
    margin-top: 25;
}

.status {
    color: $app-color;
    font-size: 16;
    margin-top: 15;
}

.record-btn {
    width: 80;
    height: 80;
    border-radius: 50;
    background-color: $app-color;
    color: #fff;
    font-size: 24;
}

.record-btn:disabled {
    width: 80;
    height: 80;
    border-radius: 50;
    background-color: #5a5a5a;
    color: #fff;
    font-size: 24;
}

.stop-btn {
    width: 80;
    height: 80;
    border-radius: 50;
    background-color: #dc3545;
    color: #fff;
    font-size: 24;
}
</style>


