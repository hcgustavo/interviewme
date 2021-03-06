<template>
    <Page actionBarHidden="true" @loaded="onPageLoaded" androidStatusBarBackground="#fff">
        <GridLayout rows="auto, auto, auto, *">
            <Button 
            class="quit-btn fa-solid" 
            horizontalAlignment="right"
            :text="timesIcon" 
            @tap="onExit"
             row="0" />
            <Image 
            src="~/assets/images/man-boss.png" 
            class="boss" 
            horizontalAlignment="center"
            row="1" />

            <Label
            class="status"
            horizontalAlignment="center"
            v-model="status"
            row="2" />

            <DockLayout stretchLastChild="false" row="3">
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

const dialogs = require("tns-core-modules/ui/dialogs");
const audio = require('nativescript-audio');

const backendService = new BackendService();
const interviewService = new InterviewService();
const player = new audio.TNSPlayer();
const recorder = new audio.TNSRecorder();

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
            timesIcon: FontAwesome.getIcon(FontAwesome.Icon.TIMES),
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
                    console.error(JSON.stringify(error));
                    this.$feedback.error({
                        title: "Oups :(",
                        message: "Une erreur s'est produite. Veuillez essayer de nouveau plus tard."
                    })
                },
                infoCallback: (info) => {
                    console.log(JSON.stringify(info));
                }
            })
            .then(res => {
                console.log("Playing audio...");
            })
            .catch(error => {
                console.log("Could not play audio: " + error);
                this.$feedback.error({
                    title: "Oups :(",
                    message: "Une erreur s'est produite. Veuillez essayer de nouveau plus tard."
                })
            })
        },

        recordAnswer() {
            if(!TNSRecorder.CAN_RECORD()) {
                this.$feedback.info({
                        title: "Oups :(",
                        message: "Cet appareil ne peut pas enregistrer d'audio."
                })
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
                    this.isRecording = false;
                    console.error(JSON.stringify(error));
                    this.$feedback.error({
                        title: "Oups :(",
                        message: "Une erreur s'est produite. Veuillez essayer de nouveau plus tard."
                    })
                }
            })
            .then(res => {
                console.log("Recording...");
            })
            .catch(error => {
                this.isRecording = false;
                console.error("Error recording: " + error);
                this.$feedback.error({
                    title: "Oups :(",
                    message: "Une erreur s'est produite. Veuillez essayer de nouveau plus tard."
                })
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
                    player.dispose();
                    recorder.dispose();

                    this.$loadingIndicator.show("En train de téléverser vos réponses...");

                    // Upload user's answers
                    interviewService.saveUserInterview(this.answers)
                    .then(result => {
                        this.$loadingIndicator.hide();
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
                        this.$loadingIndicator.hide();
                        console.error("Error uploading answers: " + error);
                        dialogs.alert({
                            title: "Oups...",
                            message: "Impossible de sauvegarder votre entrevue. Essayez de nouveau plus tard.",
                            okButtonText: "OK"
                        }).then(() => {
                            this.$navigateTo(Main, {clearHistory: true});
                        })
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
                this.$feedback.error({
                        title: "Oups :(",
                        message: "Une erreur s'est produite. Veuillez essayer de nouveau plus tard."
                })
            })
        },

        getFile() {
            const audioFolder = knownFolders.currentApp().getFolder('audio');
            const recordedFile = audioFolder.getFile(this.lastRecordedAudioName);
            return recordedFile;
        },

        onExit() {
            dialogs.confirm({
                title: "Quitter la session",
                message: "Voulez-vous vraiment quitter la session? Vos réponses ne seront pas enrégistrées.",
                okButtonText: "Oui",
                cancelButtonText: "Non"
            }).then(yes => {
                if(yes) {
                    player.dispose();
                    recorder.dispose();
                    this.$navigateTo(Main, {clearHistory: true});
                }
            })
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

.quit-btn {
    width: 50;
    height: 50;
    margin-top: -10;
    font-size: 20;
    border-width: 1;
    border-color: transparent;
    color: $app-color;
}
</style>


