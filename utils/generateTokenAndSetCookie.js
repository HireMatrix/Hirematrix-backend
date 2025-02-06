import jwt from 'jsonwebtoken';

/*
    ~ xss (cross site scripting) using only the http script it can't be acessed on the client side and read only by the server.
    ~ secure set is set to true, this makes the cookies to be sent to secure connections only like https
    ~ sameSite:- this makes the cookies to be sent to the same site from which request is orginating, it prevents the cross site request forgery(CSRF) attacks. 
*/

export const generateTokenAndSetCookie = async (res, userId) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "7d"});
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
        sameSite: process.env.NODE_ENV == "production"? "none": "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
};