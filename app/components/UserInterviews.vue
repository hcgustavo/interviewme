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
            marginTop="15"
            for="(interview, index) in interviews" 
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
                            :text="formatCreatedDate(interview.created)" 
                            row="1" />
                        </GridLayout>
                    </CardView>
                </v-template>
            </RadListView>
        </GridLayout>
    </Page>
</template>

<script>
import PlaybackInterview from './PlaybackInterview';
import InterviewService from '../services/InterviewService';

const interviewService = new InterviewService();

export default {
    data() {
        return {
            interviews: [],
            isLoaded: false,
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
                console.log(JSON.stringify(this.interviews));
            })
            .catch(error => {
                this.$loadingIndicator.hide();
                console.error("Error loading interviews: " + error);
                alert("Une erreur s'est produite.");
            })
        },

        onInterviewTap({item}) {
            // Go to interview playback page
            console.log(JSON.stringify(item));
            this.$navigateTo(PlaybackInterview, {props: {interview: item}});
        },

        formatCreatedDate(created) {
            let date = new Date(created);
            let day = (date.getDate() < 10) ? '0' + String(date.getDate()) : date.getDate();
            let month = (date.getMonth()+1 < 10) ? '0' + String(date.getMonth()+1) : date.getMonth()+1;

            let formattedDate = `${date.getFullYear()}-${month}-${day}`;
            let formattedTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            return formattedDate + ' ' + formattedTime;
        }
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
</style>


