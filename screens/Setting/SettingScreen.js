import React, { useEffect, useRef, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView, Modal,
    Pressable, ScrollView, TouchableOpacity, View
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { SvgXml } from 'react-native-svg';
import '../../language/i18n';
import { DescriptionText } from '../component/DescriptionText';
//import OpenFile from 'react-native-doc-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from 'react-native-google-signin';
import { NavigationActions, StackActions } from 'react-navigation';
import { useDispatch, useSelector } from 'react-redux';
import chewronRightSvg from '../../assets/common/chewron_right.svg';
import arrowBendUpLeft from '../../assets/login/arrowbend.svg';
import closeBlackSvg from '../../assets/record/closeBlack.svg';
import heartSvg from '../../assets/setting/blank_heart.svg';
import trashSvg from '../../assets/setting/blue_trash.svg';
import contactsSvg from '../../assets/setting/contacts.svg';
import logoutSvg from '../../assets/setting/logout.svg';
import referSvg from '../../assets/setting/refer.svg';
import termsSvg from '../../assets/setting/terms.svg';
import websiteSvg from '../../assets/setting/website.svg';
import { ACCESSTOKEN_KEY, Avatars, MAIN_LANGUAGE, windowWidth } from '../../config/config';
import EditService from '../../services/EditService';
import { setSocketInstance } from '../../store/actions';
import { MyColorButton } from '../component/MyColorButton';
import { SelectLanguage } from '../component/SelectLanguage';
import { SemiBoldText } from '../component/SemiBoldText';
import { SettingList } from '../component/SettingList';
import { TitleText } from '../component/TitleText';
import { styles } from '../style/Common';

const SettingScreen = (props) => {

    let { user, socketInstance } = useSelector((state) => {
        return (
            state.user
        )
    });

    const dispatch = useDispatch();

    let userData = { ...user };

    const [showModal, setShowModal] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);

    const mounted = useRef(false);

    const { t, i18n } = useTranslation();

    const onNavigate = (des, par = null) => {
        const resetActionTrue = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: des, params: par })],
        });
        props.navigation.dispatch(resetActionTrue);
    }

    const OnSelectLanguage = async () => {
        EditService.changeLanguage(language.language);
        i18n.changeLanguage(language.language).then(async () => {
            await AsyncStorage.setItem(
                MAIN_LANGUAGE,
                language.language
            );
        })
            .catch(err => console.log(err));
    }

    const renderName = (fname, lname) => {
        let fullname = '';
        if (fname)
            fullname = fname;
        if (lname) {
            if (fname) fullname += ' ';
            fullname += lname;
        }
        return fullname
    }

    const sendLogOut = async () => {
        setShowModal(false);
        await AsyncStorage.removeItem(
            ACCESSTOKEN_KEY
        );
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn)
            await GoogleSignin.signOut();
        socketInstance.disconnect();
        dispatch(setSocketInstance(null));
        onNavigate("Welcome");
    }

    const pressTerms = () => {
        // if (Platform.OS === 'ios') {
        //     //IOS
        //     OpenFile.openDoc([{
        //         url: "https://storage.googleapis.com/voccosrg/CGUVOCCO.docx",
        //         fileNameOptional: "Terms and conditions"
        //     }], (error, url) => {
        //         if (error) {
        //             console.error(error);
        //         } else {
        //             console.log(url)
        //         }
        //     })
        // } else {
        //     //Android
        //     OpenFile.openDoc([{
        //         url: "https://storage.googleapis.com/voccosrg/CGUVOCCO.docx", // Local "file://" + filepath
        //         fileName: "Terms and conditions",
        //         cache: false,
        //         fileType: "docx"
        //     }], (error, url) => {
        //         if (error) {
        //             console.error(error);
        //         } else {
        //             console.log(url)
        //         }
        //     })
        // }
    }

    const deleteAccount = () => {
        EditService.deleteAccount().then(async res => {
            await AsyncStorage.removeItem(
                ACCESSTOKEN_KEY
            );
            socketInstance.disconnect();
            dispatch(setSocketInstance(null));
            const isSignedIn = await GoogleSignin.isSignedIn();
            if (isSignedIn)
                await GoogleSignin.signOut();
            onNavigate("Welcome");
            if (mounted.current)
                setShowModal(false);
        })
    }

    const renderFullName = (v) => {
        let firstName = v.split(' ')[0];
        let lastName = v.split(' ')[1];
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        lastName = lastName ? (lastName.charAt(0).toUpperCase() + lastName.slice(1)) : '';
        return '@' + firstName + ' ' + lastName;
    }

    useEffect(() => {
        GoogleSignin.configure({
            androidClientId: '411872622691-jtn0id6ql8ugta4i8qo962tngerf79vl.apps.googleusercontent.com',
            iosClientId: '1034099036541-va0ioishaoaueb7elaogc2ra1h4u1if3.apps.googleusercontent.com'
        });
    }, [])
    return (
        <KeyboardAvoidingView
            style={{
                backgroundColor: '#FFF',
                flex: 1
            }}
        >
            <View style={styles.titleContainer}>
                <TouchableOpacity style={{ position: 'absolute', left: 16 }} onPress={() => props.navigation.goBack()}>
                    <SvgXml
                        width={24}
                        height={24}
                        xml={arrowBendUpLeft}
                    />
                </TouchableOpacity>
                <TitleText
                    text={t("Setting")}
                    fontSize={20}
                    lineHeight={24}
                />
            </View>
            <ScrollView style={{ marginTop: 5 }}>
                <TouchableOpacity onPress={() => props.navigation.navigate('Account')} style={[styles.rowSpaceBetween, { paddingVertical: 16, marginHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F2F0F5' }]}>
                    <View style={styles.rowAlignItems}>
                        <Image
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                marginRight: 16
                            }}
                            source={userData.avatar ? { uri: userData.avatar.url } : Avatars[userData.avatarNumber].uri}
                        />
                        <View>
                            <SemiBoldText
                                text={userData.name}
                                fontSize={17}
                                lineHeight={28}
                            />
                            <DescriptionText
                                text={renderFullName(userData.firstname)}
                                fontSize={13}
                                lineHeight={21}
                            />
                        </View>
                    </View>
                    <SvgXml
                        width={24}
                        height={24}
                        xml={chewronRightSvg}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => props.navigation.navigate('Premium')} style={[styles.rowSpaceBetween, { paddingVertical: 16, paddingHorizontal: 16, backgroundColor: 'rgba(255, 247, 232, 1)' }]}>
                    <View style={styles.rowAlignItems}>
                        <Image
                            source={require('../../assets/setting/premium_icon.png')}
                            style={{
                                width: 40,
                                height: 40
                            }}
                        />
                        <SemiBoldText
                            text={t("Upgrade to Premium")}
                            fontSize={17}
                            lineHeight={28}
                            color='rgba(243, 171, 0, 1)'
                            marginLeft={16}
                        />
                    </View>
                    <SvgXml
                        width={24}
                        height={24}
                        xml={chewronRightSvg}
                    />
                </TouchableOpacity>
                <View style={{ marginHorizontal: 16, width: windowWidth - 32, height: 1, backgroundColor: 'rgba(242, 240, 245, 1)' }}>
                </View>
                {/* <SettingList
                    svgRoute={passwordSvg}
                    svgRight={chewronRightSvg}
                    titleContent={t("Change password")}
                    onPressList={() => props.navigation.navigate('ChangePassword')}
                /> */}
                <SettingList
                    svgRoute={referSvg}
                    svgRight={chewronRightSvg}
                    titleContent={t("Refer to a Friend")}
                    onPressList={() => props.navigation.navigate('ShareFriend')}
                />
                <SettingList
                    svgRoute={termsSvg}
                    svgRight={chewronRightSvg}
                    titleContent={t("Terms and Conditions")}
                    onPressList={() => pressTerms()}
                />
                <SettingList
                    svgRoute={contactsSvg}
                    svgRight={chewronRightSvg}
                    titleContent={t("Contacts")}
                    onPressList={() => props.navigation.navigate('Contact')}
                />
                <SettingList
                    svgRoute={websiteSvg}
                    svgRight={chewronRightSvg}
                    titleContent={t("Language")}
                    onPressList={() => setShowLanguageModal(true)}
                />
                <SettingList
                    svgRoute={heartSvg}
                    rightCheck={false}
                    titleContent={t("Rate us")}
                    onPressList={() => { }}
                />
                <SettingList
                    svgRoute={trashSvg}
                    rightCheck={false}
                    titleContent={t("Delete my account")}
                    onPressList={() => setDeleteModal(true)}
                />
                <SettingList
                    svgRoute={logoutSvg}
                    rightCheck={false}
                    titleContent={t("Logout")}
                    onPressList={() => setShowModal(true)}
                />
            </ScrollView>
            {/* <BottomButtons
                active='settings'
                props={props}
            /> */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showModal}
                onRequestClose={() => {
                    //  Alert.alert("Modal has been closed.");
                    setShowModal(!showModal);
                }}
            >
                <Pressable onPressOut={() => setShowModal(false)} style={styles.swipeModal}>
                    <View style={{
                        marginTop: 300,
                        width: windowWidth - 48,
                        height: 181,
                        marginHorizontal: 24,
                        borderRadius: 24,
                        backgroundColor: 'white',
                        shadowColor: 'rgba(1, 1, 19, 0.5)',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.5,
                        shadowRadius: 8,
                        elevation: 1
                    }}>
                        <SemiBoldText
                            text={t("Log out?")}
                            fontSize={20}
                            lineHeight={24}
                            marginTop={35}
                            marginLeft={24}
                        />
                        <DescriptionText
                            text={t("Are you sure you want to log out?")}
                            fontSize={15}
                            lineHeight={24}
                            color='rgba(54, 36, 68, 0.8)'
                            marginTop={13}
                            marginLeft={24}
                        />
                        <View style={{ flexDirection: 'row', marginTop: 27, marginLeft: windowWidth / 2 - 38 }}>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <SemiBoldText
                                    text={t("Cancel")}
                                    fontSize={15}
                                    lineHeight={24}
                                    color='#E41717'
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => sendLogOut()}>
                                <SemiBoldText
                                    text={t("Validate")}
                                    fontSize={15}
                                    lineHeight={24}
                                    color='#8327D8'
                                    marginLeft={56}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={deleteModal}
                onRequestClose={() => {
                    setDeleteModal(!deleteModal);
                }}
            >
                <Pressable onPressOut={() => setDeleteModal(false)} style={styles.swipeModal}>
                    <View style={styles.swipeInputContainerContent}>
                        <View style={[styles.rowSpaceBetween, { paddingHorizontal: 14, paddingVertical: 12 }]}>
                            <TouchableOpacity onPress={() => setDeleteModal(false)}>
                                <View style={[styles.contentCenter, { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F4FC' }]}>
                                    <SvgXml
                                        width={18}
                                        height={18}
                                        xml={closeBlackSvg}
                                    />
                                </View>
                            </TouchableOpacity>
                            <SemiBoldText
                                text={t("Delete account")}
                                fontSize={17}
                                lineHeight={28}
                                marginRight={15}
                                color='#263449'
                            />
                            <TouchableOpacity onPress={() => deleteAccount()}>
                                {/* <DescriptionText
                                        text={t('Delete')}
                                        fontSize={17}
                                        lineHeight={28}
                                        color='#E41717'
                                    /> */}
                            </TouchableOpacity>
                        </View>
                        <DescriptionText
                            text={t("Are you sure about deleting your account?")}
                            fontSize={17}
                            lineHeight={28}
                            color='rgba(54, 36, 68, 0.8)'
                            textAlign='center'
                            marginTop={25}
                            marginLeft={18}
                            marginRight={16}
                        />
                        <View style={{ position: 'absolute', paddingHorizontal: 16, bottom: 0, width: windowWidth }}>
                            <MyColorButton
                                label={t("Delete account")}
                                marginBottom={20}
                                onPress={() => deleteAccount()}
                                color='#E41717'
                                shadowColor='rgba(244, 13, 13, 0.47)'
                            />
                        </View>
                    </View>
                </Pressable>
            </Modal>
            {showLanguageModal &&
                <SelectLanguage
                    type={"description"}
                    onCloseModal={() => setShowLanguageModal(false)}
                />
            }
            {/* <RecordIcon
                props={props}
                bottom={27}
                left={windowWidth / 2 - 27}
            /> */}
        </KeyboardAvoidingView>
    );
};

export default SettingScreen;