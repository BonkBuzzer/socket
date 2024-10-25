const { default: mongoose } = require("mongoose");
const { Chat } = require("../model/Chat");

const sendChatsToBackend = async (req, res) => {
    try {
        const { from, to, message } = req.body;
        if (from == '' || to == '' || !from || !to) {
            return res.status(401).json({ message: 'for chat creation both user ids are needed.' })
        }
        const fromId = new mongoose.Types.ObjectId(from);
        const toId = new mongoose.Types.ObjectId(to);
        const participantIds = [fromId, toId].sort((a, b) =>
            a.toString().localeCompare(b.toString())
        );

        const chat = await Chat.findOneAndUpdate(
            {
                participants: participantIds
            },
            {
                $push: {
                    messages: {
                        sender: fromId,
                        message
                    }
                }
            },
            {
                upsert: true,
                new: true
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Message sent successfully!',
            chat
        });

    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong!',
            error: error.message
        });
    }
};

const fetchChat = async (req, res) => {
    try {
        const { id1, id2 } = req.body;
        let mId1 = new mongoose.Types.ObjectId(id1);

        let query;
        if (id2 && id2.trim() !== '') {
            let mId2 = new mongoose.Types.ObjectId(id2);
            query = { participants: { $all: [mId1, mId2] } };
        } else {
            query = { participants: mId1 };
        }
        let fetchedChats = await Chat.find(query).select('messages.message messages.sender messages.createdAt -_id');
        const allMessages = fetchedChats.map(chat => chat.messages.map(msg => ({
            content: msg.message,
            fromSelf: msg.sender == id1 ? true : false,
            time: msg.createdAt
        }))).flat();

        res.status(200).json({
            message: 'wait lad',
            chat: allMessages,
            otherUserIdForStorage: id2
        });
    } catch (error) {
        res.status(500).json({
            message: 'Something went wrong!',
            error: error.message,
        });
    }
};

module.exports = { sendChatsToBackend, fetchChat }