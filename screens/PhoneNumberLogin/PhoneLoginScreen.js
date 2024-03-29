import React, { useEffect, useRef, useState } from 'react';
import { View, ImageBackground, TouchableOpacity, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import * as Progress from "react-native-progress";
import PhoneInput from "react-native-phone-number-input";
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import rightArrowSvg from '../../assets/phoneNumber/right-arrow.svg';
import facebookSvg from '../../assets/login/facebook0.svg';
import errorSvg from '../../assets/phoneNumber/error.svg';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import appleSvg from '../../assets/login/apple0.svg';
import googleSvg from '../../assets/login/google0.svg';
import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
import { appleAuth, appleAuthAndroid, AppleButton } from '@invertase/react-native-apple-authentication';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import '../../language/i18n';
import { styles } from '../style/Welcome';
import { MyProgressBar } from '../component/MyProgressBar';
import { windowWidth, windowHeight, TUTORIAL_CHECK, SOCKET_URL, OPEN_COUNT, ACCESSTOKEN_KEY, REFRESHTOKEN_KEY } from '../../config/config';
import AuthService from '../../services/AuthService';
import { SemiBoldText } from '../component/SemiBoldText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationActions, StackActions } from 'react-navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setSocketInstance, setUser } from '../../store/actions';
import { io } from 'socket.io-client';
import { v4 as uuid } from 'uuid'
import {
    AccessToken,
    GraphRequest,
    GraphRequestManager,
    LoginManager,
} from 'react-native-fbsdk';

const PhoneLoginScreen = (props) => {

    let { socketInstance } = useSelector((state) => {
        return (
            state.user
        )
    });

    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    const [formattedValue, setFormattedValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [country, setCountry] = useState('France');

    const dispatch = useDispatch();

    const { t, i18n } = useTranslation();
    const phoneInput = useRef();
    const mounted = useRef(false);
    const mainName = useRef();

    const phoneLogin = () => {
        const payload = {
            phoneNumber: formattedValue
        };
        setLoading(true);
        AuthService.phoneLogin(payload).then(async res => {
            if (mounted.current) {
                const jsonRes = await res.json();
                if (res.respInfo.status === 201) {
                    props.navigation.navigate('PhoneVerify', { number: formattedValue, country: country, type: 'login' })
                }
                else {
                    setError(jsonRes.message);
                }
                setLoading(false);
            }
        })
    }

    const _storeData = async (aToken, rToken) => {
        try {
            await AsyncStorage.setItem(
                ACCESSTOKEN_KEY,
                aToken
            );
        } catch (err) {
            console.log(err);
        }

        try {
            await AsyncStorage.setItem(
                REFRESHTOKEN_KEY,
                rToken
            );
        } catch (err) {
            console.log(err);
        }
    };

    const onGoScreen = async (jsonRes, prevOpenCount) => {
        if (!mounted.current)
            return;
        AuthService.checkNewDay().then(async res => {
            const isNewDay = await res.json();
            if (res.respInfo.status == 200 && isNewDay) {
                let userData = { ...jsonRes };
                userData.score++;
                dispatch(setUser(userData));
            }
        })
            .catch(err => {
                console.log(err);
            })
        let openCount = await AsyncStorage.getItem(OPEN_COUNT);
        if (openCount != prevOpenCount)
            return;
        if (prevOpenCount == null)
            openCount = "1";
        else
            openCount = (Number(prevOpenCount) + 1).toString();
        await AsyncStorage.setItem(
            OPEN_COUNT,
            openCount
        );
        jsonRes.country = country;
        if(mainName.current)
            jsonRes.firstname = mainName.current;
        dispatch(setUser(jsonRes));
        let navigateScreen = 'Home';
        if (!jsonRes.id) {
            return;
        }
        if (!jsonRes.firstname) {
            navigateScreen = 'MainName';
        }
        else if (!jsonRes.name) {
            navigateScreen = 'PickName';
        } else if (!jsonRes.dob) {
            navigateScreen = 'InputBirthday';
        } else if (!jsonRes.gender) {
            navigateScreen = 'SelectIdentify';
            // } else if (!jsonRes.avatar&&!jsonRes.avatarId) {
            //     navigateScreen = 'ProfilePicture';
        } else {
            navigateScreen = 'Home';
        }
        const resetActionTrue = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: navigateScreen })],
        });
        props.navigation.dispatch(resetActionTrue);
    }

    const onCreateSocket = async (jsonRes, isRegister) => {
        dispatch(setUser(jsonRes));
        let open_count = await AsyncStorage.getItem(OPEN_COUNT);
        if (socketInstance == null) {
            let socket = io(SOCKET_URL);
            socket.on("connect", () => {
                socket.emit("login", { uid: jsonRes.id, email: jsonRes.phoneNumber, isNew: isRegister }, (res) => {
                    if (res == "Success") {
                        dispatch(setSocketInstance(socket));
                        onGoScreen(jsonRes, open_count);
                    }
                    else {
                        setError("User with current phone number already login");
                    }
                });
            })
        }
        else
            onGoScreen(jsonRes, open_count);

        // let socket = io(SOCKET_URL);
        // dispatch(setSocketInstance(socket));
        // onGoScreen(jsonRes, open_count);
    }

    const onSetUserInfo = async (accessToken, refreshToken, isRegister = false) => {
        AuthService.getUserInfo(accessToken, isRegister ? 'reg' : '').then(async res => {
            setLoading(false);
            const jsonRes = await res.json();
            if (res.respInfo.status == 200 && mounted.current) {
                onCreateSocket(jsonRes, isRegister);
            }
        })
            .catch(err => {
                console.log(err);
            });
    }

    const onAppleButtonPress = async () => {
        // Generate secure, random values for state and nonce
        const rawNonce = uuid();
        const state = uuid();
        // Configure the request
        appleAuthAndroid.configure({
            //The Service ID you registered with Apple
            //clientId: 'com.vocco.client-android',
            clientId: 'com.voiceden.client-android',

            // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
            // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
            redirectUri: 'https://vocco.ai',

            // The type of response requested - code, id_token, or both.
            responseType: appleAuthAndroid.ResponseType.ALL,

            // The amount of user information requested from Apple.
            scope: appleAuthAndroid.Scope.ALL,

            // Random nonce value that will be SHA256 hashed before sending to Apple.
            nonce: rawNonce,

            // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
            state,
        });

        // Open the browser window for user sign in
        const response = await appleAuthAndroid.signIn();
        // Send the authorization code to your backend for verification
        AuthService.appleLogin({ identityToken: response.id_token }).then(async res => {
            const jsonRes = await res.json();
            if (res.respInfo.status === 201) {
                _storeData(jsonRes.accessToken, jsonRes.refreshToken);
                onSetUserInfo(jsonRes.accessToken, jsonRes.refreshToken, jsonRes.isRegister);
            }
            else {
                setError(jsonRes.message);
            }
            setLoading(false);
        })
            .catch(err => {
                console.log(err);
            })
    }

    const OnIosAppleLogin = async () => {
        try {
            const appleAuthRequestResponse = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME]
            })

            const { identityToken, fullName } = appleAuthRequestResponse;
            mainName.current = fullName.familyName+' '+fullName.givenName+' '+'';
            AuthService.appleLogin({ identityToken: identityToken }).then(async res => {
                const jsonRes = await res.json();
                if (res.respInfo.status === 201) {
                    _storeData(jsonRes.accessToken, jsonRes.refreshToken);
                    onSetUserInfo(jsonRes.accessToken, jsonRes.refreshToken, jsonRes.isRegister);
                }
                else {
                    setError(jsonRes.message);
                    setLoading(false);
                }
            })
                .catch(err => {
                    console.log(err);
                })

        } catch (error) {

        }
    }

    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const { idToken } = await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();
            setLoading(true);
            AuthService.googleLogin({ token: tokens.accessToken }).then(async res => {
                const jsonRes = await res.json();
                if (res.respInfo.status === 201) {
                    _storeData(jsonRes.accessToken, jsonRes.refreshToken);
                    onSetUserInfo(jsonRes.accessToken, jsonRes.refreshToken, jsonRes.isRegister);
                }
                else {
                    setError(jsonRes.message);
                }
                setLoading(false);
            })
                .catch(err => {
                    console.log(err);
                })
        } catch (error) {
            console.log(error, statusCodes, error.code);
        }
    };

    const getInfoFromToken = (token) => {
        const PROFILE_REQUEST_PARAMS = {
            fields: {
                string: 'id',
            },
        };
        const profileRequest = new GraphRequest(
            '/me',
            { token, parameters: PROFILE_REQUEST_PARAMS },
            (error, result) => {
                if (error) {
                    console.log('login info has error: ' + error);
                } else {
                    setLoading(true);
                    AuthService.facebookLogin({ facebookId: result.id }).then(async res => {
                        const jsonRes = await res.json();
                        if (res.respInfo.status === 201) {
                            _storeData(jsonRes.accessToken, jsonRes.refreshToken);
                            onSetUserInfo(jsonRes.accessToken, jsonRes.refreshToken, jsonRes.isRegister);
                        }
                        else {
                            setError(jsonRes.message);
                            setLoading(false);
                        }
                    })
                        .catch(err => {
                            console.log(err);
                        })
                    console.log('result:', result);
                }
            },
        );
        new GraphRequestManager().addRequest(profileRequest).start();
    };

    const loginWithFacebook = () => {
        LoginManager.logInWithPermissions(['public_profile']).then(
            login => {
                if (login.isCancelled) {
                    console.log('Login cancelled');
                } else {
                    AccessToken.getCurrentAccessToken().then(data => {
                        const accessToken = data.accessToken.toString();
                        getInfoFromToken(accessToken);
                    });
                }
            },
            error => {
                console.log('Login fail with error: ' + error);
            },
        );
    };

    useEffect(() => {
        mounted.current = true;
        GoogleSignin.configure({
            //  androidClientId: '90267401771-77i4i3fcq72p10ksvl5kbt0r1tf3gkvm.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
            //webClientId: '1072354006907-3e714aeo627nna8bt3cfru4htmub0u6p.apps.googleusercontent.com',
            iosClientId: '90267401771-af45frgqut4g5asdnk28kljs7ir87iv2.apps.googleusercontent.com',
        });
        return () => {
            mounted.current = false;
        }
    }, [])

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <ImageBackground
                source={require('../../assets/login/logo_background.png')}
                resizeMode="stretch"
                style={[styles.background, { alignItems: 'center' }]}
            >
                <View
                    style={[
                        { width: windowWidth, marginTop: Platform.OS == 'ios' ? 50 : 20, paddingHorizontal: 12, marginBottom: 47, height: 30 },
                        styles.rowSpaceBetween
                    ]}
                >
                    <TouchableOpacity
                        onPress={() => props.navigation.goBack()}
                    >
                        <SvgXml
                            width="24"
                            height="24"
                            xml={arrowBendUpLeft}
                        />
                    </TouchableOpacity>

                    <View>
                    </View>
                </View>
                <TitleText
                    text={t("Hi again! What's your number?")}
                    textAlign='center'
                    maxWidth={300}
                    color='#FFF'
                />
                <DescriptionText
                    text={t("We'll text a code to verify your phone")}
                    fontSize={15}
                    lineHeight={24}
                    textAlign='center'
                    marginTop={8}
                    color='#FFF'
                />
                <View style={{
                    alignItems: 'center',
                    marginTop: 45
                }}>
                    <PhoneInput
                        ref={phoneInput}
                        defaultValue={value}
                        defaultCode="FR"
                        placeholder="95 123 4567"
                        onChangeText={(text) => {
                            setValue(text);
                            setError('');
                        }}
                        onChangeFormattedText={(text) => {
                            setFormattedValue(text);
                        }}
                        onChangeCountry={(country) => {
                            setCountry(country.name);
                        }}
                        autoFocus
                    />
                    {error != '' && <View style={[styles.rowAlignItems, { marginTop: 10 }]}>
                        <SvgXml
                            width={24}
                            height={24}
                            xml={errorSvg}
                        />
                        <DescriptionText
                            text={t(error)}
                            fontSize={12}
                            lineHeigh={16}
                            marginLeft={8}
                            color='#E41717'
                        />
                    </View>}
                </View>
                <DescriptionText
                    text={t("or continue with")}
                    fontSize={12}
                    lineHeight={16}
                    color="#FFF"
                    textAlign='center'
                    marginTop={76}
                />
                <View style={{
                    alignItems: 'center',
                    marginTop: 20
                }}>
                    {Platform.OS === 'ios' ?
                        <AppleButton
                            buttonStyle={AppleButton.Style.DEFAULT}
                            style={{
                                width: 200,
                                height: 40,
                            }}
                            buttonType={AppleButton.Type.SIGN_IN}
                            textStyle={{
                                fontSize: 17,
                                lineHeight: 20,
                                color: '#000'
                            }}
                            onPress={() => OnIosAppleLogin()}
                        /> :
                        <TouchableOpacity style={{
                            width: 200,
                            height: 40,
                            borderRadius: 6,
                            backgroundColor: '#FFF',
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center'
                        }}
                            onPress={() => onAppleButtonPress()}
                        >
                            <SvgXml
                                xml={appleSvg}
                                width={17}
                                height={17}
                            />
                            <SemiBoldText
                                text={t("Sign in with Apple")}
                                fontSize={16}
                                lineHeight={20}
                                marginLeft={2}
                                color='#000'
                            />
                        </TouchableOpacity>
                    }

                    <TouchableOpacity style={{
                        width: 200,
                        height: 40,
                        borderRadius: 6,
                        backgroundColor: '#FFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        marginTop: 12
                    }}
                        onPress={() => signIn()}
                    >
                        <SvgXml
                            xml={googleSvg}
                            width={17}
                            height={17}
                        />
                        <SemiBoldText
                            text={t("Sign in with Google")}
                            fontSize={16}
                            lineHeight={20}
                            marginLeft={3}
                            color='#000'
                        />
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={{
                        width: 200,
                        height: 40,
                        borderRadius: 6,
                        backgroundColor: '#FFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        marginTop: 12
                    }}
                        onPress={() => loginWithFacebook()}
                    >
                        <SvgXml
                            xml={facebookSvg}
                            width={13}
                            height={13}
                        />
                        <SemiBoldText
                            text={t("Sign in with Facebook")}
                            fontSize={16}
                            lineHeight={20}
                            marginLeft={7}
                            color='#000'
                        />
                    </TouchableOpacity> */}
                </View>
                <TouchableOpacity style={{
                    position: 'absolute',
                    right: 16,
                    bottom: 16,
                }}
                    onPress={() => phoneLogin()}
                    disabled={!phoneInput.current?.isValidNumber(value)}
                >
                    <LinearGradient
                        style={
                            {
                                height: 56,
                                width: 56,
                                borderRadius: 28,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row'
                            }
                        }
                        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                        colors={phoneInput.current?.isValidNumber(value) ? ['#8274CF', '#2C235C'] : ['#CFC7FA', '#7A62FA']}
                    >
                        <SvgXml
                            width={32}
                            height={32}
                            xml={rightArrowSvg}
                        />
                    </LinearGradient>
                </TouchableOpacity>
                {loading &&
                    <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(1,1,1,0.3)' }}>
                        <View style={{ marginTop: windowHeight / 2.5, alignItems: 'center', width: windowWidth }}>
                            <Progress.Circle
                                indeterminate
                                size={30}
                                color="rgba(0, 0, 255, 0.7)"
                                style={{ alignSelf: "center" }}
                            />
                        </View>
                    </View>
                }
            </ImageBackground>
        </TouchableWithoutFeedback>
    );
};

export default PhoneLoginScreen;