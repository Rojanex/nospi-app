import {View, Text, ScrollView, Image, TouchableOpacity} from 'react-native'
import React from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import images from '@/constants/images';
import icons from '@/constants/icons';

const SignIn = () => {
    const handleLogin = () => {
    };


    return (
        <SafeAreaView className="bg-white h-full">
            <ScrollView contentContainerClassName="h-full">

                <View className="px-10">
                    <Text className="text-base text-center uppercase font-rubik text-black-200">Welcome to
                        Nospi Club</Text>
                    <Text className="text-3xl font-rubik-bold text-black-300 text-center mt-2">
                        Let's Get You Closer to {"\n"}
                        <Text className="text-primary-300">Your ideal parche</Text>
                    </Text>

                    <Text className="text-lg font-rubik text-black-200 text-center mt-12">
                        Ingresa a Nospi
                    </Text>
                    <TouchableOpacity onPress={handleLogin}
                                      className={"bg-white shadow-md shadow-zinc-300 rounded-full w-full py-4 mt-5"}>
                        <View className="flex flex-row items-center justify-center">

                            <Image source={icons.google} className={"w-5 h-5"} resizeMode={"contain"}/>
                            <Text className={"text-lg font-rubik-medium text-black-300 ml-2"}>
                                Continua con Google</Text>
                        </View>

                    </TouchableOpacity>
                    <Image source={images.starLogin} className="w-full h-4/6" resizeMode="contain"/>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
export default SignIn
