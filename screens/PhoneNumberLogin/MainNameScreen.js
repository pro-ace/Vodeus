import React, { useEffect, useRef, useState } from 'react';
import { View, ImageBackground, TouchableOpacity, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import PhoneInput from "react-native-phone-number-input";
import { SvgXml } from 'react-native-svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import rightArrowSvg from '../../assets/phoneNumber/right-arrow.svg';
import errorSvg from '../../assets/phoneNumber/error.svg';
import { TitleText } from '../component/TitleText';
import { DescriptionText } from '../component/DescriptionText';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import '../../language/i18n';

import { styles } from '../style/Welcome';
import { MyProgressBar } from '../component/MyProgressBar';
import { windowWidth } from '../../config/config';
import { TextInput } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../store/actions';

const MainNameScreen = (props) => {


    const [value, setValue] = useState("");
    const [error, setError] = useState('');

    const { t, i18n } = useTranslation();

    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const checkUsername = (newVal) => {
        setValue(newVal);
        setError('');
    }

    const handleSubmit = () => {
        let userName=value.trim();
        let reg = /^[a-zA-Z0-9_ ]+$/;
        if (reg.test(userName) == false) {
            setError("Username is not available");
        }
        else if (userName.length < 3) {
            setError("Username must be at least 3 letters");
        }
        else {
            let userData = { ...user };
            userData.firstname = userName+' '+'';
            dispatch(setUser(userData));
            props.navigation.navigate('PickName');
        }
    }

    useEffect(() => {
    }, [])

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <ImageBackground
                source={require('../../assets/phoneNumber/background.png')}
                resizeMode="cover"
                style={styles.background}
            >
                <View
                    style={[
                        { marginTop: Platform.OS == 'ios' ? 50 : 20, paddingHorizontal: 12, marginBottom: 47, height: 30 },
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
                    text={t("What's your full name?")}
                    textAlign='center'
                />
                <View style={{
                    width: windowWidth,
                    alignItems: 'center',
                    marginTop: 53
                }}>
                    <View style={{
                        // paddingVertical: 14,
                        borderRadius: 8,
                        paddingHorizontal: 24,
                        borderWidth: 3,
                        borderColor: '#FFF',
                        backgroundColor: 'rgba(255, 255, 255, 0.6)'
                    }}>
                        <TextInput
                            style={
                                {
                                    fontSize: 28,
                                    lineHeight: 34,
                                    color: '#281E30',
                                    width: windowWidth - 60
                                }
                            }
                            textAlign='center'
                            maxWidth={250}
                            value={value}
                            autoCapitalize='words'
                            onChangeText={e => checkUsername(e)}
                        />
                    </View>
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
                <TouchableOpacity style={{
                    position: 'absolute',
                    right: 16,
                    bottom: 16,
                }}
                    onPress={() => handleSubmit()}
                    disabled={value.length < 3}
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
                        colors={value.length > 2 ? ['#8274CF', '#2C235C'] : ['#CFC7FA', '#7A62FA']}
                    >
                        <SvgXml
                            width={32}
                            height={32}
                            xml={rightArrowSvg}
                        />
                    </LinearGradient>
                </TouchableOpacity>
            </ImageBackground>
        </TouchableWithoutFeedback>
    );
};

export default MainNameScreen;