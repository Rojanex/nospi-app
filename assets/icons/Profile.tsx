import Svg, {Path} from "react-native-svg";

type IconProps = {
    size?:number;
    color?:string;
}

export const Profile = ({ size = 24, color = "Colors.primary.100" }: IconProps) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path fillRule="evenodd" clipRule="evenodd" d="M11.8445 21.6619C8.15273 21.6619 5 21.0874 5 18.7867C5 16.4859 8.13273 14.3619 11.8445 14.3619C15.5364 14.3619 18.6891 16.4653 18.6891 18.7661C18.6891 21.0659 15.5564 21.6619 11.8445 21.6619Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></Path>
            <Path fillRule="evenodd" clipRule="evenodd" d="M11.8372 11.1737C14.26 11.1737 16.2236 9.21002 16.2236 6.7873C16.2236 4.36457 14.26 2.40002 11.8372 2.40002C9.41452 2.40002 7.44998 4.36457 7.44998 6.7873C7.4418 9.20184 9.3918 11.1655 11.8063 11.1737C11.8172 11.1737 11.8272 11.1737 11.8372 11.1737Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></Path>
        </Svg>
    )
}