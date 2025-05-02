const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { isValidObjectId, Types } = require("mongoose");

//Dashboard Data
exports.getDashboardData = async (req, res) => {
   try{
    const userId = req.user.id;
    const userObjectId = new Types.ObjectId(String(userId));

    // Fetch total income & expenses
    const totalIncome = await Income.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    console.log("totalIncome", {totalIncome, userId: isValidObjectId(userId)});

    const totalExpense = await Expense.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },

    ]);
    // Get income transaction in the last 60 days
    const last60DaysIncomeTransactions = await Income.find({
        userId,
        date: { $get: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },

    }).sort({ date: -1 });

    // Get total income for last 60  days
    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
    );

    //Get expense transactions in the last 30 days
    const last30DaysIncomeTransactions = await Income.find({
        userId,
        date: { $get: new Date(Date.now() - 30 * 24 * 30 * 30 * 1000) },

    }).sort({ date: -1 });

    // Get total income for last 30  days
    const incomeLast30Days = last30DaysIncomeTransactions.reduce(
        (sum, transaction) => sum + transaction.amount,
    );

    //Fetch last 5 Transaction (income + expense)
    const lastTransaction = [
        ...(await Income.find({ userId }).sort({ date: -1 }).limit(5)).map(
            (txn) => ({
            ...txn.toObject(),
            type: "income",
        })
        ),
        ...(await Expense.find({ userId }).sort({ date: -1 }).limit(5)).map(
            (txn) => ({
                ...txn.toObject(),
                    type: "expense",
            })
        ),
    ].sort((a, b) => b.date); // Sort latest first

    // Final Response
    res.json({
        totalBalance:
        (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
        totalIncome: totalIncome[0]?.total || 0,
        totalExpense: totalExpense[0]?.total || 0,
        last30DaysExpenses: {
            total: expenseLast30days,
            transaction: last30DaysExpenseTransactions,
        },
        last60DaysIncome: {
            total: incomeLast60Days,
            transactions: last60DaysIncomeTransactions,
        },
        recentTransactions: last30DaysIncomeTransactions,

    });
    
   } catch (error) {
    res.status(500).json({ message: "Server Error", error });
   }
}