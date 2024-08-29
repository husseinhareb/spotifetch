import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ProfileData {
    display_name: string;
    followers: number;
    profile_url: string;
}

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<ProfileData | null>(null);

    useEffect(() => {
        axios.get<ProfileData>('http://localhost:8000/profile')
            .then(response => {
                setProfile(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the profile!", error);
            });
    }, []);

    if (!profile) return <div>Loading...</div>;

    return (
        <div>
            <h1>{profile.display_name}</h1>
            <p>Followers: {profile.followers}</p>
            <a href={profile.profile_url} target="_blank" rel="noopener noreferrer">Profile</a>
        </div>
    );
}

export default Profile;
