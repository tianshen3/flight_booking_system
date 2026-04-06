import jwt from "jsonwebtoken";

//creating short lived Access token
export const generateAccessToken = (userId, role) => {
    return jwt.sign(
        {
            userId,
            role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//creating long lived Refresh token
export const generateRefreshTokne = (userId, role) => {
    return jwt.sign(
        {
            userId,
            role,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}