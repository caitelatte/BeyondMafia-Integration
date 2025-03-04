import React, { useState, useEffect, useContext } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";

import Host from "./Host";
import { useForm } from "../../../components/Form";
import { useErrorAlert } from "../../../components/Alerts";
import { SiteInfoContext } from "../../../Contexts";
import { Lobbies } from "../../../Constants";

import "../../../css/host.css"

export default function HostMafia() {
    const gameType = "Mafia";
    const [selSetup, setSelSetup] = useState({});
    const [redirect, setRedirect] = useState(false);
    const siteInfo = useContext(SiteInfoContext);
    const errorAlert = useErrorAlert();
    const [formFields, updateFormFields] = useForm([
        {
            label: "Setup",
            ref: "setup",
            type: "text",
            disabled: true,
        },
        {
            label: "Lobby",
            ref: "lobby",
            type: "select",
            value: localStorage.getItem("lobby") || "Main",
            options: Lobbies.map(lobby => ({ label: lobby, value: lobby })),
        },
        {
            label: "Private",
            ref: "private",
            type: "boolean",
            showIf: "!ranked"
        },
        {
            label: "Allow Guests",
            ref: "guests",
            type: "boolean",
            showIf: "!ranked"
        },
        {
            label: "Ranked",
            ref: "ranked",
            type: "boolean",
            showIf: ["!private", "!spectating", "!voiceChat", "!guests"]
        },
        {
            label: "Spectating",
            ref: "spectating",
            type: "boolean",
            showIf: "!ranked"
        },
        {
            label: "Voice Chat",
            ref: "voiceChat",
            type: "boolean",
            showIf: "!ranked"
        },
        {
            label: "Scheduled",
            ref: "scheduled",
            type: "boolean"
        },
        {
            label: "Start Date",
            ref: "startDate",
            type: "datetime-local",
            showIf: "scheduled",
            value: Date.now() + (6 * 60 * 1000),
            min: Date.now() + (6 * 60 * 1000),
            max: Date.now() + (4 * 7 * 24 * 60 * 60 * 1000)
        },
        {
            label: "Ready Check",
            ref: "readyCheck",
            type: "boolean"
        },
        {
            label: "Day Length (minutes)",
            ref: "dayLength",
            type: "number",
            value: 10,
            min: 1,
            max: 30
        },
        {
            label: "Night Length (minutes)",
            ref: "nightLength",
            type: "number",
            value: 2,
            min: 1,
            max: 10
        },
        {
            label: "Extension Length (minutes)",
            ref: "extendLength",
            type: "number",
            value: 3,
            min: 1,
            max: 5
        }
    ]);

    useEffect(() => {
        document.title = "Host Mafia | BeyondMafia";
    }, []);

    function onHostGame() {
        var scheduled = getFormFieldValue("scheduled");
        var lobby = getFormFieldValue("lobby");

        if (lobby == "All")
            lobby = "Main";

        if (selSetup.id)
            axios.post("/game/host", {
                gameType,
                lobby,
                setup: selSetup.id,
                private: getFormFieldValue("private"),
                guests: getFormFieldValue("guests"),
                ranked: getFormFieldValue("ranked"),
                spectating: getFormFieldValue("spectating"),
                voiceChat: getFormFieldValue("voiceChat"),
                scheduled: scheduled && (new Date(getFormFieldValue("startDate"))).getTime(),
                readyCheck: getFormFieldValue("readyCheck"),
                stateLengths: {
                    "Day": getFormFieldValue("dayLength"),
                    "Night": getFormFieldValue("nightLength")
                },
                extendLength: getFormFieldValue("extendLength"),
            })
                .then(res => {
                    if (scheduled) {
                        siteInfo.showAlert(`Game scheduled.`, "success");
                        setRedirect("/");
                    }
                    else
                        setRedirect(`/game/${res.data}`);
                })
                .catch(errorAlert);
        else
            errorAlert("You must choose a setup");
    }

    function getFormFieldValue(ref) {
        for (let field of formFields)
            if (field.ref == ref)
                return field.value;
    }

    if (redirect)
        return <Redirect to={redirect} />

    return (
        <Host
            gameType={gameType}
            selSetup={selSetup}
            setSelSetup={setSelSetup}
            formFields={formFields}
            updateFormFields={updateFormFields}
            onHostGame={onHostGame} />
    );
}