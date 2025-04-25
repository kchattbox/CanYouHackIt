from flask import Blueprint, render_template, request, jsonify, current_app, make_response, redirect, url_for, session
from app.container.azure_container import launch_container, check_container_exists
import sqlite3

DATABASE = "/home/ubuntu/ITC266_Project/azure-scripts/container-deployment-webapp/app/database/database.db"

main = Blueprint('main', __name__)

def get_db():
    return sqlite3.connect(DATABASE, check_same_thread=False)

@main.after_request
def allow_cors(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@main.route('/')
def index():
    return redirect(url_for("main.second_index"))
    return render_template('index.html')

@main.route('/launch')
def second_index():
    return render_template('launch.html')

@main.route('/challenge', methods=["GET", "POST"])
def display_challenge():
    if request.method == "GET":
        return render_template('challenge.html')

    elif request.method == "POST":
        fingerprint = request.form.get('fingerprint')
        #fingerprint = "test_fingerprint"
        con = get_db()
        cur = con.cursor()
        res = cur.execute("SELECT container_id FROM fingerprints WHERE fingerprint = ? ORDER BY id DESC", (fingerprint,))
        container_id = res.fetchall()[0][0]
        exists, ip = check_container_exists(container_id) 
        #ip, timer, status = get_container_info()
        return render_template('challenge.html', ip=ip, timer=10, status="active")

@main.route('/get-container', methods=["POST"])
def get_container():
    data = request.json
    fingerprint = data['fingerprint']
    if fingerprint == None:
        return jsonify({"message": "Fingerprint not found"})
    con = get_db()
    cursor = con.cursor()
    res = cursor.execute("SELECT container_id FROM fingerprints WHERE fingerprint = ? ORDER BY id DESC", (fingerprint,))
    container_id = res.fetchall()[0][0]
    exists, ip = check_container_exists(container_id)
    return jsonify({"ip": ip})

@main.route('/store-fingerprint', methods=['POST'])
def store_fingerprint(): 
    fingerprint = request.headers.get('X-Canvas_Fingerprint')
    if fingerprint != None:
        con = get_db()
        cursor = con.cursor()
        cursor.execute("INSERT INTO fingerprints (fingerprint) VALUES (?)", (fingerprint,))
        con.commit()
        con.close()
        return "SUCCESS"
    else:
        return "FAILURE"

@main.route('/new-launch-container', methods=["POST"])
def new_deploy_container():
    try:
        result = launch_container()
        con = get_db()
        cur = con.cursor()
        fingerprint = request.json['fingerprint']
        cur.execute("INSERT INTO fingerprints (fingerprint, container_id) VALUES (?, ?)", (fingerprint, result['container_name'],))
        con.commit()
        cur.close()
        return jsonify({
            'success': True,
            'container_name': result['container_name'],
            'ip': result['ip'],
            'ports': result['ports']
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@main.route('/launch-container', methods=['POST'])
def deploy_container():
    try:
        result = launch_container()
        return jsonify({
            'success': True,
            'container_name': result['container_name'],
            'ip': result['ip'],
            'ports': result['ports']
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@main.route('/container-status')
def container_status():
    container_name = request.args.get('name')
    if not container_name:
        return jsonify({"active": False, "error": "No container name provided"}), 400
    
    exists, ip = check_container_exists(container_name)
    
    return jsonify({
        "active": exists,
        "ip": ip if exists else None
    }), 200


@main.route('/check_flag', methods=["POST"])
def check_flag():
    flag = "flag{a1way5_p4tch!}"
    if request.get_json(force=True)['flag'] == flag:
        text =  "CORRECT"
    else:
        text = "INCORRECT: " + str(request.get_json(force=True)['flag'])
    response = make_response(text, 200)
    response.headers["Content-Type"] = "text/plain"
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Content-Length"] = str(len(text))
    return response
