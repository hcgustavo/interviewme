<template>
    <Page actionBarHidden="true" androidStatusBarBackground="#fff">
        <GridLayout rows="auto, 3*, *">
            <Label class="title" marginTop="15" text="Interview.me" horizontalAlignment="center" row="0" />

            <StackLayout orientation="vertical" verticalAlignment="center" row="1">
                <Button class="btn" text="COMMENCER UNE ENTREVUE" @tap="onStartInterview" />
                <Button class="btn" marginTop="30" text="VOIR MES ENTREVUES" @tap="onSeeInterviews" />
            </StackLayout>

            <DockLayout stretchLastChild="false" row="2">
                <Button 
                class="fa-solid signout-btn" 
                :text="signOutAltIcon" 
                horizontalAlignment="center" 
                @tap="signOut"
                dock="bottom" />
            </DockLayout>
        </GridLayout>
    </Page>
</template>

<script>
import QuestionsNumber from './QuestionsNumber';
import UserInterviews from './UserInterviews';
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
            this.$navigateTo(QuestionsNumber);
        },

        onSeeInterviews() {
            this.$navigateTo(UserInterviews);
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


