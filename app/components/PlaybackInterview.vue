<template>
    <Page actionBarHidden="true" androidStatusBarBackground="#fff" @loaded="onLoadedPage">
        <GridLayout rows="auto, auto, auto, *" padding="0">
            <Button 
            class="quit-btn fa-solid" 
            horizontalAlignment="right"
            :text="timesIcon" 
            @tap="onExit"
             row="0" />

            <Image 
            src="~/assets/images/man-boss.png"
            horizontalAlignment="center" 
            row="1" />

            <Image
            :src="userPhoto"
            horizontalAlignment="center" 
            row="2" />

            <DockLayout stretchLastChild="false" row="3">
                <Button 
                dock="bottom" 
                text="RÉÉCOUTER L'ENTREVUE"
                v-show="!isPlayingback"
                @tap="onPlayback" />
                <Button 
                dock="bottom" 
                :text="playbackText"
                v-show="isPlayingback"
                @tap="onTogglePlayback" />
            </DockLayout>
        </GridLayout>
    </Page>
</template>

<script>
import InterviewService from '../services/InterviewService';
import { TNSPlayer } from 'nativescript-audio';
import { backendService } from '../main';
import * as FontAwesome from '../utils/font-awesome';

const dialogs = require("tns-core-modules/ui/dialogs");

const interviewService = new InterviewService();
const player = new TNSPlayer();

export default {
    props: ['interview'],

    data() {
        return {
            userPhoto: (backendService.photo !== "") ? backendService.photo : "~/assets/images/interviewed.png",
            playbackAudios: [],
            currentIndex: 0,
            isPlayingback: false,
            isPaused: false,
            playbackText: "METTRE EN PAUSE",

            // Icons
            timesIcon: FontAwesome.getIcon(FontAwesome.Icon.TIMES),
        }
    },

    methods: {
        onLoadedPage() {
            this.$loadingIndicator.show("Chargement de l'entrevue en cours...");
            interviewService.loadUserInterview(this.interview)
            .then(result => {
                this.makePlaybackAudios(result.questions, result.answers);
                this.$loadingIndicator.hide();
            })
            .catch(error => {
                console.error("Error loading interview session: " + error);
                this.$loadingIndicator.hide();
                this.$feedback.error({
                    title: "Oups :(",
                    message: "Une erreur s'est produite. Veuillez essayer de nouveau plus tard."
                })
            })
        },

        onPlayback() {
            this.currentIndex = 0;
            this.isPlayingback = true;
            this.playback(this.currentIndex);
        },

        onTogglePlayback() {
            if(this.isPaused) {
                player.resume();
                this.playbackText = "METTRE EN PAUSE";
            } else {
                player.pause();
                this.playbackText = "CONTINUER";
            }
            this.isPaused = !this.isPaused;
        },

        playback() {
            player.playFromUrl({
                audioFile: this.playbackAudios[this.currentIndex],
                loop: false,
                completeCallback: () => {
                    console.log("Audio completed playing");
                    if(this.currentIndex < this.playbackAudios.length - 1) {
                        this.currentIndex++;
                        this.playback();
                    } else {
                        this.isPlayingback = false;
                        player.dispose();
                        console.log("Done playingback interview");
                        this.$feedback.info({
                            title: "C'est terminé!",
                            message: "Vous avez réécouté toute votre entrevue."
                        })
                    }
                },
                errorCallback: (error) => {
                    this.isPlayingback = false;
                    player.dispose();
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
                this.isPlayingback = false;
                player.dispose();
                console.error("Error playing audio: " + error);
                this.$feedback.error({
                    title: "Oups :(",
                    message: "Une erreur s'est produite. Veuillez essayer de nouveau plus tard."
                })
            })
        },

        makePlaybackAudios(questions, answers) {
            let size = questions.length;
            let isQuestion = true;

            questions.forEach((question, index) => {
                this.playbackAudios.push(question.downloadUrl);
                this.playbackAudios.push(answers[index].downloadUrl);
            })
        },

        onExit() {
            dialogs.confirm({
                title: "Quitter la session",
                message: "Voulez-vous vraiment quitter la session?",
                okButtonText: "Oui",
                cancelButtonText: "Non"
            }).then(yes => {
                if(yes) {
                    player.dispose();
                    this.$navigateBack();
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../app.scss';

Image {
    width: 150;
    height: 150;
    border-radius: 100;
    margin-top: 50;
}

Button {
    background-color: $app-color;
    color: #fff;
}

Button:disabled {
    background-color: #5e5e5e;
    color: #fff;
}

.quit-btn {
    width: 50;
    height: 50;
    margin-top: -10;
    font-size: 20;
    border-width: 1;
    border-color: transparent;
    background-color: transparent;
    color: $app-color;
}
</style>


