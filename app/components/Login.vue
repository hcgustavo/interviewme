<template>
    <Page actionBarHidden="true" androidStatusBarBackground="#fff">
        <GridLayout rows="auto, auto, *">
            <Image
            src="~/assets/images/man-boss.png" 
            class="logo-image" 
            horizontalAlignment="center"
            row="0" />
            
            <Label 
            class="title" 
            text="Interview.me" 
            horizontalAlignment="center"
            row="1" />

            <StackLayout orientation="vertical" verticalAlignment="center" row="2">
                <Button class="facebook-btn" @tap="loginFacebook">
                    <FormattedString>
                        <Span class="fa-brands" :text="facebookIcon" />
                        <Span text="  Connectez-vous avec Facebook" />
                    </FormattedString>
                </Button>
                <Button class="google-btn" marginTop="10" @tap="loginGoogle">
                    <FormattedString>
                        <Span class="fa-brands" :text="googleIcon" />
                        <Span text="  Connectez-vous avec Google" />
                    </FormattedString>
                </Button>
            </StackLayout>
        </GridLayout>
    </Page>
</template>

<script>
import Main from './Main';
import * as FontAwesome from '../utils/font-awesome';

const dialogs = require("tns-core-modules/ui/dialogs");

export default {
    data() {
        return {

            // Icons
            facebookIcon: FontAwesome.getIcon(FontAwesome.Icon.FACEBOOK),
            googleIcon: FontAwesome.getIcon(FontAwesome.Icon.GOOGLE)
        }
    },

    methods: {
        loginFacebook() {
            this.$authService.loginFacebook();
        },

        loginGoogle() {
            this.$authService.loginGoogle();
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../app.scss';

.logo-image {
    margin-top: 20;
    width: 100;
    height: 100;
}

.title {
    color: $app-color;
    font-weight: bold;
    font-size: 42;
}

.facebook-btn {
    color: #3B5998;
    border-width: 1;
    border-color: #3B5998;
    background-color: transparent
}

.google-btn {
    color: #D62D20;
    border-width: 1;
    border-color: #D62D20;
    background-color: transparent;
}
</style>


