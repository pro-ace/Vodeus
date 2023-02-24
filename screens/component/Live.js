import React, { useState, useEffect, useRef, useReducer, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Share from 'react-native-share';
import { SvgXml } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import LinearGradient from "react-native-linear-gradient";
import { Menu } from 'react-native-material-menu';

import '../../language/i18n';
import { FeedStories } from './FeedStories';
import { Categories, windowWidth, Days, Months } from '../../config/config';
import { TemporaryStories } from './TemporaryStories';
import { setUser, setUsed } from '../../store/actions';
import { FriendStories } from './FriendStories';
import { styles } from '../style/Common';
import { SemiBoldText } from './SemiBoldText';
import { DescriptionText } from './DescriptionText';
import VoiceService from '../../services/VoiceService';

import ShareSvg from '../../assets/friend/share.svg';
import DropdownSvg from '../../assets/Feed/monthdown.svg';
import { LinearTextGradient } from 'react-native-text-gradient';
import { TitleText } from './TitleText';
import searchSvg from '../../assets/login/search.svg';
import { TextInput } from 'react-native-gesture-handler';
import { MyButton } from './MyButton';
import { CreateRoom } from './CreateRoom';
import { SendbirdCalls } from '@sendbird/calls-react-native';
import { BirdRoom } from './BirdRoom';
import { BirdRoomItem } from './BirdRoomItem';

export const Live = ({
  props,
  initRoomId,
}) => {

  const mounted = useRef(false);

  const { t, i18n } = useTranslation();

  const [searchLabel, setSearchLabel] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [currentRoomInfo, setCurrentRoomInfo] = useState(null);
  const [rooms, setRooms] = useState([]);

  let { user, socketInstance } = useSelector((state) => {
    return (
      state.user
    )
  });

  const onSearchLabel = (e) => {
    setSearchLabel(e);
  }

  const roomItems = useMemo(() => {
    return <ScrollView style={{
      marginBottom: 90
    }}>
      {rooms.map((item, index) => {
        if (!item.title.toLowerCase().includes(searchLabel.toLocaleLowerCase()) || (categoryId && categoryId != item.categoryId))
          return null;
        return <BirdRoomItem
          key={index + 'BirdRoomItem'}
          props={props}
          info={item}
          onEnterRoom={() => {
            //setCurrentRoomInfo(rooms[index]);
          }}
        />
      })}
      <View style={{ height: 80 }}></View>
    </ScrollView>
  }, [rooms, searchLabel, categoryId])

  const onCreateRoom = async (title, id) => {
    setShowModal(false);
    const createRoomInfo = {
      hostUser: user,
      roomId: null,
      title,
      categoryId: id,
      participants: []
    };
    setCurrentRoomInfo(createRoomInfo);
  }

  useEffect(() => {
    mounted.current = true;
    socketInstance.emit("getBirdRooms", (rooms) => {
      if (mounted.current) {
        setRooms(rooms);
        if (initRoomId) {
          let index = rooms.findIndex(el => el.roomId == initRoomId);
          //if (index != -1)
            //setCurrentRoomInfo(rooms[index]);
        }
      }
    })
    socketInstance.on("createBirdRoom", ({ info }) => {
      console.log("createBirdRoom", info.roomId);
      setRooms((prev) => {
        prev.unshift(info);
        return [...prev];
      });
      if (info.hostUser.id == user.id) {
        setCurrentRoomInfo(info);
        console.log("hostUser::", info.participants);
      }
    });
    socketInstance.on("deleteBirdRoom", ({ info }) => {
      setRooms((prev) => {
        let index = prev.findIndex(el => (el.roomId == info.roomId));
        if (index != -1) {
          prev.splice(index, 1);
        }
        return [...prev];
      });
    });
    socketInstance.on("enterBirdRoom", ({ info }) => {
      console.log("enterBirdRoom", info.roomId);
      let index = -1;
      setRooms((prev) => {
        index = prev.findIndex(el => (el.roomId == info.roomId));
        let p_index = prev[index].participants.findIndex(el => el.participantId == info.participantId);
        if (p_index == -1)
          prev[index].participants.push(info);
        return [...prev];
      });
    });
    socketInstance.on("exitBirdRoom", ({ info }) => {
      setRooms((prev) => {
        let index = prev.findIndex(el => (el.roomId == info.roomId));
        if (index != -1) {
          let p_index = prev[index].participants.findIndex(el => (el.participantId == info.participantId))
          if (p_index != -1) {
            prev[index].participants.splice(p_index, 1);
            // if (currentRoomInfo && prev[index].roomId == currentRoomInfo.roomId)
            //   setCurrentRoomInfo(prev[index]);
          }
        }
        return [...prev];
      });
    });
    return () => {
      mounted.current = false;
      socketInstance.off('createBirdRoom');
      socketInstance.off('enterBirdRoom');
      socketInstance.off('exitBirdRoom');
      socketInstance.off('deleteBirdRoom');
    };
  }, [])

  return (
    <View
      style={{
        backgroundColor: '#FFF',
        width: windowWidth,
        flex: 1,
      }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 24,
        height: 48,
        width: windowWidth - 36,
        paddingHorizontal: 12,
        marginTop: 2,
        marginBottom: 16,
        marginLeft: 18
      }}>
        <SvgXml
          width="20"
          height="20"
          xml={searchSvg}
        />
        <TextInput
          style={[styles.searchInput, { paddingLeft: 12, width: windowWidth - 92 }]}
          value={searchLabel}
          color='#281E30'
          placeholder={t("Search" + "...")}
          onChangeText={onSearchLabel}
          placeholderTextColor="rgba(59, 31, 82, 0.6)"
        />
      </View>
      <SemiBoldText
        text={t("Happening now")}
        fontSize={18.36}
        lineHeight={24.48}
        color='#000'
        marginLeft={21}
      />
      <DescriptionText
        text={t("Find the room discussion you like the most!")}
        fontSize={11.66}
        lineHeight={24.48}
        color='#B059F8'
        marginLeft={21}
      />
      <ScrollView
        style={{
          marginTop: 10,
          maxHeight: 50,
          minHeight: 50
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
        }}>
          {Categories.map((item, index) => {
            return <TouchableOpacity style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: categoryId == index ? '#8229F4' : '#D4C9DE',
              flexDirection: 'row',
              marginHorizontal: 4
            }}
              onPress={() => setCategoryId(index)}
              key={index.toString() + 'category'}
            >
              <Image source={item.uri}
                style={{
                  width: 20,
                  height: 20
                }}
              />
              <DescriptionText
                text={item.label == '' ? t('All') : item.label == 'Support' ? t('Support/Help') : t(item.label)}
                fontSize={14}
                lineHeight={20}
                marginLeft={10}
              />
            </TouchableOpacity>
          })}
        </View>
      </ScrollView>
      {roomItems}
      <View style={{
        position: 'absolute',
        width: windowWidth,
        bottom: 105,
        alignItems: 'center'
      }}>
        <MyButton
          label={t("Create a live room")}
          onPress={() => setShowModal(true)}
        />
      </View>
      {showModal && <CreateRoom
        props={props}
        onCreateRoom={onCreateRoom}
        onCloseModal={() => setShowModal(false)}
      />}
      {currentRoomInfo && <BirdRoom
        props={props}
        roomInfo={currentRoomInfo}
        onCloseModal={() => setCurrentRoomInfo(null)}
      />}
    </View>
  );
};
