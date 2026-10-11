from flask import Blueprint, request, jsonify
import jwt
import pandas as pd
from datetime import datetime
from config import Config
from db import db
dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api')
VALID_CATEGORIES = [
    'Electricity',
    'Internet',
    'Mobile',
    'OTT',
    'Rent',
    'EMI',
    'Insurance',
    'Other'
]
VALID_FREQUENCIES = [
    'Monthly',
    'Weekly',
    'Yearly',
    'One-time'
]
# =========================================================
# GET CURRENT USER ID
# =========================================================

def get_current_user_id(req):
    auth_header = req.headers.get('Authorization', '')

    if not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ')[1]

    try:
        payload = jwt.decode(
            token,
            Config.SECRET_KEY,
            algorithms=['HS256']
        )

        return payload.get('user_id')

    except Exception:
        return None


# =========================================================
# COMPUTE BILL STATUS
# =========================================================

def compute_bill_status(due_date_str, current_status):
    """
    Dynamically calculates Overdue status
    if due date has passed and bill is not Paid.
    """

    if current_status == 'Paid':
        return 'Paid'

    try:
        due_dt = datetime.strptime(
            str(due_date_str),
            '%Y-%m-%d'
        ).date()

        today = datetime.now().date()

        if due_dt < today:
            return 'Overdue'

    except Exception:
        pass

    return 'Pending'


# =========================================================
# DASHBOARD OVERVIEW API
# =========================================================

@dashboard_bp.route('/dashboard', methods=['GET'])
def get_dashboard_data():

    user_id = get_current_user_id(request)

    if not user_id:
        return jsonify({
            'error': 'Unauthorized access. Please login.'
        }), 401

    conn, db_type = db.get_connection()

    try:

        # =================================================
        # GET BILLS AND PAYMENTS
        # =================================================

        if db_type == 'mysql':

            with conn.cursor() as cursor:

                # Get user's bills
                cursor.execute(
                    """
                    SELECT *
                    FROM bills
                    WHERE user_id = %s
                    ORDER BY due_date ASC
                    """,
                    (user_id,)
                )

                raw_bills = cursor.fetchall()


                # Get recent payments
                cursor.execute(
                    """
                    SELECT
                        p.payment_id,
                        b.bill_name AS title,
                        p.amount,
                        p.payment_date,
                        p.payment_method,
                        p.status
                    FROM payments p
                    JOIN bills b
                        ON p.bill_id = b.bill_id
                    WHERE p.user_id = %s
                    ORDER BY p.payment_date DESC
                    LIMIT 5
                    """,
                    (user_id,)
                )

                recent_payments = cursor.fetchall()


                # Get ALL payments
                # Used for Pandas monthly analysis
                cursor.execute(
                    """
                    SELECT
                        payment_date,
                        amount
                    FROM payments
                    WHERE user_id = %s
                    """,
                    (user_id,)
                )

                all_payments = cursor.fetchall()

            conn.close()

        else:

            cursor = conn.cursor()


            # Get user's bills
            cursor.execute(
                """
                SELECT *
                FROM bills
                WHERE user_id = ?
                ORDER BY due_date ASC
                """,
                (user_id,)
            )

            raw_bills = [
                dict(row)
                for row in cursor.fetchall()
            ]


            # Get recent payments
            cursor.execute(
                """
                SELECT
                    p.payment_id,
                    b.bill_name AS title,
                    p.amount,
                    p.payment_date,
                    p.payment_method,
                    p.status
                FROM payments p
                JOIN bills b
                    ON p.bill_id = b.bill_id
                WHERE p.user_id = ?
                ORDER BY p.payment_date DESC
                LIMIT 5
                """,
                (user_id,)
            )

            recent_payments = [
                dict(row)
                for row in cursor.fetchall()
            ]


            # Get ALL payments
            # Used for Pandas monthly analysis
            cursor.execute(
                """
                SELECT
                    payment_date,
                    amount
                FROM payments
                WHERE user_id = ?
                """,
                (user_id,)
            )

            all_payments = [
                dict(row)
                for row in cursor.fetchall()
            ]


            conn.close()


        # =================================================
        # PROCESS BILLS
        # =================================================

        processed_bills = []

        total_bills = len(raw_bills)

        paid_amount = 0.0
        pending_amount = 0.0
        overdue_amount = 0.0
        overdue_count = 0

        upcoming_bills = []
        overdue_bills = []


        # =================================================
        # CATEGORY SPENDING
        # =================================================

        cat_dict = {
            cat: 0.0
            for cat in VALID_CATEGORIES
        }


        for bill in raw_bills:

            b = dict(bill)


            # Support legacy title field
            if 'bill_name' in b:
                b['title'] = b['bill_name']
            else:
                b['title'] = b.get(
                    'title',
                    'Bill'
                )


            # Calculate current status
            computed = compute_bill_status(
                b['due_date'],
                b['status']
            )

            b['status'] = computed


            # Amount
            amt = float(b['amount'])


            # Calculate summary amounts
            if computed == 'Paid':

                paid_amount += amt

            elif computed == 'Overdue':

                overdue_amount += amt

                overdue_count += 1

                overdue_bills.append(b)

            else:

                pending_amount += amt

                upcoming_bills.append(b)


            # Category spending
            cat_name = b['category']

            if cat_name in cat_dict:

                cat_dict[cat_name] += amt

            else:

                cat_dict['Other'] += amt


            processed_bills.append(b)


        # =================================================
        # CATEGORY SPENDING DATA
        # =================================================

        category_spending = [
            {
                "name": category,
                "value": round(amount, 2)
            }
            for category, amount in cat_dict.items()
            if amount > 0
        ]


        # =================================================
        # MONTHLY SPENDING USING PANDAS
        # =================================================

        month_names = {
            1: "Jan",
            2: "Feb",
            3: "Mar",
            4: "Apr",
            5: "May",
            6: "Jun",
            7: "Jul",
            8: "Aug",
            9: "Sep",
            10: "Oct",
            11: "Nov",
            12: "Dec"
        }


        # Convert payment records into DataFrame
        payment_df = pd.DataFrame(all_payments)


        if not payment_df.empty:

            # Convert payment date into datetime
            payment_df["payment_date"] = pd.to_datetime(
                payment_df["payment_date"]
            )


            # Extract month number
            payment_df["month_number"] = (
                payment_df["payment_date"].dt.month
            )


            # Group payment amounts by month
            monthly_data = (
                payment_df
                .groupby("month_number")["amount"]
                .sum()
            )

        else:

            monthly_data = {}


        # Always create all 12 months
        monthly_spending = [
            {
                "month": month_names[month],
                "amount": round(
                    float(
                        monthly_data.get(month, 0)
                    ),
                    2
                )
            }
            for month in range(1, 13)
        ]


        # =================================================
        # RETURN DASHBOARD DATA
        # =================================================

        return jsonify({

            "summary": {

                "total_bills": total_bills,

                "paid_amount": round(
                    paid_amount,
                    2
                ),

                "pending_amount": round(
                    pending_amount,
                    2
                ),

                "overdue_amount": round(
                    overdue_amount,
                    2
                ),

                "overdue_count": overdue_count
            },


            "upcoming_bills":
                upcoming_bills[:5],


            "overdue_bills":
                overdue_bills,


            "recent_payments":
                recent_payments,


            "monthly_spending":
                monthly_spending,


            "category_spending":
                category_spending

        }), 200


    except Exception as e:

        return jsonify({
            'error':
                f'Failed to retrieve dashboard data: {str(e)}'
        }), 500


# =========================================================
# GET ALL BILLS
# =========================================================

@dashboard_bp.route('/bills', methods=['GET'])
def get_bills():

    user_id = get_current_user_id(request)

    if not user_id:
        return jsonify({
            'error': 'Unauthorized access.'
        }), 401


    conn, db_type = db.get_connection()

    try:

        if db_type == 'mysql':

            with conn.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT *
                    FROM bills
                    WHERE user_id = %s
                    ORDER BY due_date ASC
                    """,
                    (user_id,)
                )

                raw_bills = cursor.fetchall()

            conn.close()

        else:

            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT *
                FROM bills
                WHERE user_id = ?
                ORDER BY due_date ASC
                """,
                (user_id,)
            )

            raw_bills = [
                dict(row)
                for row in cursor.fetchall()
            ]

            conn.close()


        bills = []

        for bill in raw_bills:

            b = dict(bill)


            if 'bill_name' not in b and 'title' in b:

                b['bill_name'] = b['title']


            b['status'] = compute_bill_status(
                b['due_date'],
                b['status']
            )


            bills.append(b)


        return jsonify({
            "bills": bills
        }), 200


    except Exception as e:

        return jsonify({
            'error': str(e)
        }), 500


# =========================================================
# CREATE BILL
# =========================================================

@dashboard_bp.route('/bills', methods=['POST'])
def create_bill():

    user_id = get_current_user_id(request)

    if not user_id:
        return jsonify({
            'error': 'Unauthorized access.'
        }), 401


    data = request.get_json() or {}


    bill_name = data.get(
        'bill_name',
        ''
    ).strip()

    category = data.get(
        'category',
        ''
    ).strip()

    amount = data.get('amount')

    due_date = data.get(
        'due_date',
        ''
    ).strip()

    frequency = data.get(
        'frequency',
        'Monthly'
    ).strip()

    description = data.get(
        'description',
        ''
    ).strip()


    # Validation
    if not bill_name:

        return jsonify({
            'error': 'Bill Name is required.'
        }), 400


    if (
        not category
        or category not in VALID_CATEGORIES
    ):

        return jsonify({
            'error':
                'Please select a valid category.'
        }), 400


    try:

        amount_num = float(amount)

        if amount_num <= 0:

            return jsonify({
                'error':
                    'Amount must be greater than 0.'
            }), 400

    except (ValueError, TypeError):

        return jsonify({
            'error':
                'Please enter a valid numeric amount.'
        }), 400


    if not due_date:

        return jsonify({
            'error':
                'Due Date is required.'
        }), 400


    if (
        not frequency
        or frequency not in VALID_FREQUENCIES
    ):

        return jsonify({
            'error':
                'Please select a valid frequency.'
        }), 400


    conn, db_type = db.get_connection()

    try:

        if db_type == 'mysql':

            with conn.cursor() as cursor:

                cursor.execute(
                    """
                    INSERT INTO bills
                    (
                        user_id,
                        bill_name,
                        category,
                        amount,
                        due_date,
                        frequency,
                        description,
                        status
                    )
                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        %s,
                        'Pending'
                    )
                    """,
                    (
                        user_id,
                        bill_name,
                        category,
                        amount_num,
                        due_date,
                        frequency,
                        description
                    )
                )

                bill_id = cursor.lastrowid

            conn.close()

        else:

            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO bills
                (
                    user_id,
                    bill_name,
                    category,
                    amount,
                    due_date,
                    frequency,
                    description,
                    status
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    'Pending'
                )
                """,
                (
                    user_id,
                    bill_name,
                    category,
                    amount_num,
                    due_date,
                    frequency,
                    description
                )
            )

            conn.commit()

            bill_id = cursor.lastrowid

            conn.close()


        return jsonify({

            'message':
                'Bill added successfully!',

            'bill_id':
                bill_id

        }), 201


    except Exception as e:

        return jsonify({
            'error':
                f'Failed to create bill: {str(e)}'
        }), 500


# =========================================================
# UPDATE BILL
# =========================================================

@dashboard_bp.route('/bills/<int:bill_id>', methods=['PUT'])
def update_bill(bill_id):

    user_id = get_current_user_id(request)

    if not user_id:
        return jsonify({
            'error': 'Unauthorized access.'
        }), 401


    data = request.get_json() or {}


    bill_name = data.get(
        'bill_name',
        ''
    ).strip()

    category = data.get(
        'category',
        ''
    ).strip()

    amount = data.get('amount')

    due_date = data.get(
        'due_date',
        ''
    ).strip()

    frequency = data.get(
        'frequency',
        'Monthly'
    ).strip()

    description = data.get(
        'description',
        ''
    ).strip()


    if not bill_name:

        return jsonify({
            'error':
                'Bill Name is required.'
        }), 400


    if (
        not category
        or category not in VALID_CATEGORIES
    ):

        return jsonify({
            'error':
                'Please select a valid category.'
        }), 400


    try:

        amount_num = float(amount)

        if amount_num <= 0:

            return jsonify({
                'error':
                    'Amount must be greater than 0.'
            }), 400

    except (ValueError, TypeError):

        return jsonify({
            'error':
                'Please enter a valid numeric amount.'
        }), 400


    if not due_date:

        return jsonify({
            'error':
                'Due Date is required.'
        }), 400


    if (
        not frequency
        or frequency not in VALID_FREQUENCIES
    ):

        return jsonify({
            'error':
                'Please select a valid frequency.'
        }), 400


    conn, db_type = db.get_connection()

    try:

        if db_type == 'mysql':

            with conn.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT bill_id
                    FROM bills
                    WHERE bill_id = %s
                    AND user_id = %s
                    """,
                    (
                        bill_id,
                        user_id
                    )
                )

                if not cursor.fetchone():

                    conn.close()

                    return jsonify({
                        'error':
                            'Bill not found or access unauthorized.'
                    }), 403


                cursor.execute(
                    """
                    UPDATE bills

                    SET
                        bill_name = %s,
                        category = %s,
                        amount = %s,
                        due_date = %s,
                        frequency = %s,
                        description = %s

                    WHERE bill_id = %s
                    AND user_id = %s
                    """,
                    (
                        bill_name,
                        category,
                        amount_num,
                        due_date,
                        frequency,
                        description,
                        bill_id,
                        user_id
                    )
                )

            conn.close()

        else:

            cursor = conn.cursor()


            cursor.execute(
                """
                SELECT bill_id
                FROM bills
                WHERE bill_id = ?
                AND user_id = ?
                """,
                (
                    bill_id,
                    user_id
                )
            )


            if not cursor.fetchone():

                conn.close()

                return jsonify({
                    'error':
                        'Bill not found or access unauthorized.'
                }), 403


            cursor.execute(
                """
                UPDATE bills

                SET
                    bill_name = ?,
                    category = ?,
                    amount = ?,
                    due_date = ?,
                    frequency = ?,
                    description = ?

                WHERE bill_id = ?
                AND user_id = ?
                """,
                (
                    bill_name,
                    category,
                    amount_num,
                    due_date,
                    frequency,
                    description,
                    bill_id,
                    user_id
                )
            )


            conn.commit()

            conn.close()


        return jsonify({
            'message':
                'Bill updated successfully!'
        }), 200


    except Exception as e:

        return jsonify({
            'error':
                f'Failed to update bill: {str(e)}'
        }), 500


# =========================================================
# DELETE BILL
# =========================================================

@dashboard_bp.route('/bills/<int:bill_id>', methods=['DELETE'])
def delete_bill(bill_id):

    user_id = get_current_user_id(request)

    if not user_id:
        return jsonify({
            'error':
                'Unauthorized access.'
        }), 401


    conn, db_type = db.get_connection()

    try:

        if db_type == 'mysql':

            with conn.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT bill_id
                    FROM bills
                    WHERE bill_id = %s
                    AND user_id = %s
                    """,
                    (
                        bill_id,
                        user_id
                    )
                )


                if not cursor.fetchone():

                    conn.close()

                    return jsonify({
                        'error':
                            'Bill not found or access unauthorized.'
                    }), 403


                cursor.execute(
                    """
                    DELETE FROM bills
                    WHERE bill_id = %s
                    AND user_id = %s
                    """,
                    (
                        bill_id,
                        user_id
                    )
                )

            conn.close()

        else:

            cursor = conn.cursor()


            cursor.execute(
                """
                SELECT bill_id
                FROM bills
                WHERE bill_id = ?
                AND user_id = ?
                """,
                (
                    bill_id,
                    user_id
                )
            )


            if not cursor.fetchone():

                conn.close()

                return jsonify({
                    'error':
                        'Bill not found or access unauthorized.'
                }), 403


            cursor.execute(
                """
                DELETE FROM bills
                WHERE bill_id = ?
                AND user_id = ?
                """,
                (
                    bill_id,
                    user_id
                )
            )


            conn.commit()

            conn.close()


        return jsonify({
            'message':
                'Bill deleted successfully!'
        }), 200


    except Exception as e:

        return jsonify({
            'error':
                f'Failed to delete bill: {str(e)}'
        }), 500
# =========================================================
# MARK BILL AS PAID
# =========================================================

@dashboard_bp.route(
    '/bills/<int:bill_id>/pay',
    methods=['POST', 'PATCH']
)
def pay_bill(bill_id):
    user_id = get_current_user_id(request)
    if not user_id:
        return jsonify({
            'error':
                'Unauthorized access.'
        }), 401
    conn, db_type = db.get_connection()
    try:
        if db_type == 'mysql':
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT *
                    FROM bills
                    WHERE bill_id = %s
                    AND user_id = %s
                    """,
                    (
                        bill_id,
                        user_id
                    )
                )
                bill = cursor.fetchone()
                if not bill:

                    conn.close()

                    return jsonify({
                        'error':
                            'Bill not found or access unauthorized.'
                    }), 403
                # Update bill status
                cursor.execute(
                    """
                    UPDATE bills

                    SET status = 'Paid'

                    WHERE bill_id = %s
                    AND user_id = %s
                    """,
                    (
                        bill_id,
                        user_id
                    )
                )
                # Record payment
                cursor.execute(
                    """
                    INSERT INTO payments
                    (
                        user_id,
                        bill_id,
                        amount,
                        payment_method,
                        status
                    )

                    VALUES
                    (
                        %s,
                        %s,
                        %s,
                        'UPI',
                        'Completed'
                    )
                    """,
                    (
                        user_id,
                        bill_id,
                        bill['amount']
                    )
                )
            conn.close()
        else:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT *
                FROM bills
                WHERE bill_id = ?
                AND user_id = ?
                """,
                (
                    bill_id,
                    user_id
                )
            )
            row = cursor.fetchone()
            if not row:
                conn.close()

                return jsonify({
                    'error':
                        'Bill not found or access unauthorized.'
                }), 403
            bill = dict(row)
            # Update bill status
            cursor.execute(
                """
                UPDATE bills

                SET status = 'Paid'

                WHERE bill_id = ?
                AND user_id = ?
                """,
                (
                    bill_id,
                    user_id
                )
            )
            # Record payment
            cursor.execute(
                """
                INSERT INTO payments
                (
                    user_id,
                    bill_id,
                    amount,
                    payment_method,
                    status
                )

                VALUES
                (
                    ?,
                    ?,
                    ?,
                    'UPI',
                    'Completed'
                )
                """,
                (
                    user_id,
                    bill['bill_id'],
                    bill['amount']
                )
            )
            conn.commit()
            conn.close()
        return jsonify({
            'message':
                'Bill marked as Paid successfully!'
        }), 200
    except Exception as e:

        return jsonify({
            'error':
                f'Failed to process payment: {str(e)}'
        }), 500
# =========================================================
# GET PAYMENTS
# =========================================================

@dashboard_bp.route('/payments', methods=['GET'])
def get_payments():
    user_id = get_current_user_id(request)
    if not user_id:
        return jsonify({
            'error':
                'Unauthorized access.'
        }), 401
    conn, db_type = db.get_connection()
    try:
        if db_type == 'mysql':
            with conn.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT
                        p.payment_id,
                        b.bill_name AS title,
                        p.amount,
                        p.payment_date,
                        p.payment_method,
                        p.status

                    FROM payments p

                    JOIN bills b
                        ON p.bill_id = b.bill_id

                    WHERE p.user_id = %s

                    ORDER BY p.payment_date DESC
                    """,
                    (user_id,)
                )
                payments = cursor.fetchall()

            conn.close()
        else:

            cursor = conn.cursor()

            cursor.execute(
                """
                SELECT
                    p.payment_id,
                    b.bill_name AS title,
                    p.amount,
                    p.payment_date,
                    p.payment_method,
                    p.status

                FROM payments p

                JOIN bills b
                    ON p.bill_id = b.bill_id

                WHERE p.user_id = ?

                ORDER BY p.payment_date DESC
                """,
                (user_id,)
            )
            payments = [
                dict(row)
                for row in cursor.fetchall()
            ]
            conn.close()
        return jsonify({
            "payments":
                payments
        }), 200
    except Exception as e:

        return jsonify({
            'error':
                str(e)
        }), 500