<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, *, auto" padding="0">
            <Label 
            class="title"
            textWrap="true"
            text="Combien de questions voulez-vous répondre?" 
            horizontalAlignment="center" 
            row="0" />

            <ListPicker 
            :items="listOfItems" 
            selectedIndex="0"
            @selectedIndexChange="selectedIndexChanged"
            row="1" />

            <Button
            text="COMMENCER"
            @tap="loadQuestions"
            row="2" />
        </GridLayout>
    </Page>
</template>

<script>
import Question from './Question';
import MyLoadingIndicator from '../utils/loading-indicator';
import InterviewService from '../services/InterviewService';

const dialogs = require("tns-core-modules/ui/dialogs");
const interviewService = new InterviewService();
const loadingIndicator = new MyLoadingIndicator();

export default {
    data() {
        return {
            listOfItems: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            selectedItem: 5,
        }
    },

    methods: {
        selectedIndexChanged(args) {
            this.selectedItem = this.listOfItems[args.object.selectedIndex];
        },

        loadQuestions() {
            loadingIndicator.show("Téléchargement de questions en cours...");
            interviewService.loadQuestions(this.selectedItem)
                .then(result => {
                    loadingIndicator.hide();
                    this.$navigateTo(Question, {clearHistory: true, props: {questions: result}});
                })
                .catch(error => {
                    loadingIndicator.hide();
                    console.error("Error loading questions: " + error);
                    alert("Une erreur s'est produite.");
                })  
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../app.scss';

Button {
    margin: 0;
    background-color: $app-color;
    color: #fff;
}

.title {
    margin-top: 20;
    color: $app-color;
    font-weight: bold;
    font-size: 22;
    text-align: center;
}
</style>


