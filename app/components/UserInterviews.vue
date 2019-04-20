<template>
    <Page actionBarHidden="true" androidStatusBarBackground="#fff" @loaded="onPageLoaded">
        <GridLayout rows="auto, *">
            <Label class="title" horizontalAlignment="center" text="Mes entrevues" row="0" />
            <Label 
            verticalAlignment="center" 
            horizontalAlignment="center" 
            text="Vous n'avez pas d'entrevue enregistré"
            row="1"
            v-if="isLoaded && interviews.length === 0" />
            <RadListView 
            ref="listView"
            marginTop="15"
            for="(interview, index) in interviews" 
            swipeActions="true"
            @itemSwipeProgressStarted="onSwipeStarted"
            @itemTap="onInterviewTap" 
            row="1">
                <v-template>
                    <CardView margin="10" elevation="10" radius="5">
                        <GridLayout rows="auto, auto">
                            <Label
                            fontSize="16"
                            fontWeight="bold" 
                            :text="'Entrevue #' + (index + 1)" 
                            row="0" />
                            <Label 
                            marginTop="5"
                            color="#329be8"
                            fontSize="22"
                            fontWeight="bold"
                            :text="formatCreatedDate(interview.data().created)" 
                            row="1" />
                        </GridLayout>
                    </CardView>
                </v-template>

                <v-template name="itemswipe">
                    <GridLayout columns="*, auto">
                        <GridLayout id="delete-view" col="1" columns="*" class="swipe-item right" @tap="onRightSwipeClick">
                            <Label class="fa-solid" :text="trashIcon" verticalAlignment="center" horizontalAlignment="center" />
                        </GridLayout>
                    </GridLayout>
                </v-template>
            </RadListView>
        </GridLayout>
    </Page>
</template>

<script>
import PlaybackInterview from './PlaybackInterview';
import InterviewService from '../services/InterviewService';
import * as FontAwesome from '../utils/font-awesome';

const dialogs = require("tns-core-modules/ui/dialogs");

const interviewService = new InterviewService();

export default {
    data() {
        return {
            interviews: [],
            isLoaded: false,

            //Icons
            trashIcon: FontAwesome.getIcon(FontAwesome.Icon.TRASH),
        }
    },

    methods: {
        onPageLoaded() {
            this.isLoaded = false;
            this.interviews = [];

            this.$loadingIndicator.show("En cours de télécharger vos entrevues...");
            interviewService.loadUserInterviews()
            .then(interviews => {
                this.$loadingIndicator.hide();
                this.isLoaded = true;
                this.interviews = [...interviews];
            })
            .catch(error => {
                this.$loadingIndicator.hide();
                console.error("Error loading interviews: " + error);
                this.$feedback.error({
                    title: "Oups :(",
                    message: "Une erreur s'est produite lors de le téléchargement de vos entrevues. Veuillez essayer de nouveau plus tard."
                })
            })
        },

        onInterviewTap({item}) {
            // Go to interview playback page
            console.log(JSON.stringify(item));
            this.$navigateTo(PlaybackInterview, {props: {interview: item.data()}});
        },

        formatCreatedDate(created) {
            let date = new Date(created);
            let day = (date.getDate() < 10) ? '0' + String(date.getDate()) : date.getDate();
            let month = (date.getMonth()+1 < 10) ? '0' + String(date.getMonth()+1) : date.getMonth()+1;

            let formattedDate = `${date.getFullYear()}-${month}-${day}`;
            let formattedTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            return formattedDate + ' ' + formattedTime;
        },

        onSwipeStarted ({ data, object }) {
            const swipeLimits = data.swipeLimits;
            const swipeView = object;
            const rightItem = swipeView.getViewById('delete-view');
            swipeLimits.right = rightItem.getMeasuredWidth();
            swipeLimits.threshold = rightItem.getMeasuredWidth() / 2;
        },

        onRightSwipeClick ({object}) {
            dialogs.confirm({
                title: "Attention!",
                message: "Voulez-vous vraiment supprimer cette entrevue?",
                okButtonText: "Oui",
                cancelButtonText: "Non"
            }).then(yes => {
                if(yes) {
                    interviewService.removeInterviewById(object.bindingContext.id)
                    .then(result => {
                        this.interviews.splice(this.interviews.indexOf(object.bindingContext), 1);
                        this.$feedback.success({
                            title: "C'est fait!",
                            message: "Votre entrevue a été supprimée avec succès."
                        })
                    })
                    .catch(error => {
                        console.error("Error removing interview: " + error);
                        this.$feedback.error({
                            title: "Oups :(",
                            message: "Une erreur s'est produite. Veuillez essayer de nouveau plus tard."
                        })
                    })
                }
                this.$refs.listView.notifySwipeToExecuteFinished();
            })
        },
    }
}
</script>

<style lang="scss" scoped>
@import '../app.scss';

.title {
    color: $app-color;
    font-size: 22;
    font-weight: bold;
}

.swipe-item {
    width: 50;
}
</style>


