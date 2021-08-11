import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";

class AppNavBar extends Component {
	state = {};
	render() {
		return (
			<nav className="navbar navbar-expand-lg navbar-light bg-light">
				<Link className="navbar-brand" to="/">
					Studio
				</Link>
				<button
					className="navbar-toggler"
					type="button"
					data-toggle="collapse"
					data-target="#navbarSupportedContent"
					aria-controls="navbarSupportedContent"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				<div
					className="collapse navbar-collapse"
					id="navbarSupportedContent"
				>
					<ul className="navbar-nav mr-auto">
						<li className="nav-item">
							<Link className="nav-link" to="/firm">Aziende</Link>
						</li>
						<li className="nav-item">
							<Link className="nav-link" to="/massive-operations">Operazioni massive</Link>
						</li>
						<li className="nav-item dropdown">
							<a
								href="/#"
								className="nav-link dropdown-toggle"
								role="button"
								data-toggle="dropdown"
								aria-haspopup="true"
								aria-expanded="false"
							>
								Comunicazioni
							</a>
							<div className="dropdown-menu">
								<NavLink className="dropdown-item" to="/message/template">Template</NavLink>
								{/*<NavLink className="dropdown-item" to="/message/send">Da inviare</NavLink>*/}
							</div>
						</li>
						{/*
						<li className="nav-item dropdown">
							<a
								href="/#"
								className="nav-link dropdown-toggle"
								role="button"
								data-toggle="dropdown"
								aria-haspopup="true"
								aria-expanded="false"
							>
								Prima Nota
							</a>
							<div className="dropdown-menu">
								<NavLink
									className="dropdown-item"
									to="/primaNota/fatture"
								>
									Fatture
								</NavLink>
								<NavLink
									className="dropdown-item"
									to="/primaNota/corrispettivi"
								>
									Corrispettivi
								</NavLink>
								<div className="dropdown-divider"></div>
								<NavLink
									className="dropdown-item"
									to="/primaNota/fattureBollo"
								>
									Bollo fatture
								</NavLink>
							</div>
						</li>
						*/}
						{/* <li className="nav-item">
							<a className="nav-link" href="#">
								Link
							</a>
						</li> */}
					</ul>
					{/* search bar
					<form className="form-inline">
						<input
							className="form-control mr-sm-2"
							type="search"
							placeholder="Cerca"
							aria-label="Inserisci il nome da cercare"
						/>
						<button
							className="btn btn-outline-success my-2 my-sm-0"
							type="submit"
						>
							Cerca
						</button>
					</form>
					*/}
				</div>
			</nav>
		);
	}
}

export default AppNavBar;
