<template>
    <Page actionBarHidden="true">
        <GridLayout rows="auto, auto, *">
            <Button 
            class="fa-solid signout-btn" 
            :text="signOutAltIcon" 
            horizontalAlignment="right" 
            @tap="signOut"
            row="0" />

            <Label class="title" text="Interview.me" horizontalAlignment="center" row="1" />

            <StackLayout orientation="vertical" verticalAlignment="center" row="2">
                <Button class="btn" text="COMMENCER UNE ENTREVUE" @tap="onStartInterview" />
                <Button class="btn" text="VOIR MES ENTREVUES" marginTop="30" />
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script>
import Question from './Question';
import QuestionsNumberModal from './QuestionsNumberModal';
import * as FontAwesome from '../utils/font-awesome';

const dialogs = require("tns-core-modules/ui/dialogs");

export default {
    data() {
        return {

            // Icons
            signOutAltIcon: FontAwesome.getIcon(FontAwesome.Icon.SIGN_OUT_ALT),
        }
    },

    methods: {
        onStartInterview() {
            this.$showModal(QuestionsNumberModal, {fullscreen: true})
            .then(value => {
                //Load questions

                // After loading question, go to Question screen
                this.$navigateTo(Question, {clearHistory: true});
            })
        },

        signOut() {
            dialogs.confirm({
                title: "Déconnection",
                message: "Voulez-vous vraiment vous déconnecter?",
                okButtonText: "Oui",
                cancelButtonText: "Non"
            }).then((yes) => {
                if(yes) {
                    this.$authService.logout();
                }
            })
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../app.scss';

.title {
    color: $app-color;
    font-weight: bold;
    font-size: 42;
}

.btn {
    color: #fff;
    background-color: $app-color;
    height: 60;
    border-radius: 10;
}

.signout-btn {
    width: 50;
    height: 50;
    font-size: 18;
    color: $app-color;
    background-color: transparent;
    border-width: 1;
    border-color: transparent;
    border-radius: 50;
}
</style>


