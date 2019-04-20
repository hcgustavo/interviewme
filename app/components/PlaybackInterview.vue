<template>
    <Page actionBarHidden="true" androidStatusBarBackground="#fff" @loaded="onLoadedPage">
        <GridLayout rows="auto, auto, *" padding="0">
            <Image 
            src="~/assets/images/man-boss.png"
            horizontalAlignment="center" 
            row="0" />

            <Image
            :src="userPhoto"
            horizontalAlignment="center" 
            row="1" />

            <DockLayout stretchLastChild="false" row="2">
                <Button 
                dock="bottom" 
                text="RÉÉCOUTER L'ENTREVUE"
                :isEnabled="!isPlayingback"
                @tap="onPlayback" />
            </DockLayout>
        </GridLayout>
    </Page>
</template>

<script>
import InterviewService from '../services/InterviewService';
import { TNSPlayer } from 'nativescript-audio';
import { backendService } from '../main';

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
</style>


