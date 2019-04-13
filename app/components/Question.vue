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
                @tap="recordAnswer" />
            </DockLayout>
        </GridLayout>
    </Page>
</template>

<script>
import CountdownModal from './CountdownModal';
import * as FontAwesome from '../utils/font-awesome';

export default {
    data() {
        return {
            status: "",
            canRecord: false,

            // Icons
            microphoneIcon: FontAwesome.getIcon(FontAwesome.Icon.MICROPHONE),
        }
    },

    methods: {
        onPageLoaded() {
            this.$showModal(CountdownModal, {fullscreen: true})
            .then(() => {
                this.status = "En train d'écouter la question...";
            })
        },

        recordAnswer() {

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
</style>


